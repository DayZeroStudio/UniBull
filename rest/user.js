module.exports = function(routePrefix, callback) {
    "use strict";
    // For routing
    var express = require("express");
    var router = express.Router();
    var bodyParser = require("body-parser");
    router.use(bodyParser.json());

    // Utility, Encryption, JWT
    var _ = require("lodash");
    function append(a, b) {return a+b; }
    var expressJwt = require("express-jwt");
    var jwt = require("jsonwebtoken");

    // App
    var UserModel = require("../models/user");
    var User = UserModel.dbModel;
    var cfg = require("../config");
    var log = cfg.log.logger;

    function getTokenFromRequest(req) {
        var auth = req.headers.authorization;
        if (auth&& auth.split(" ")[0] === "Bearer") {
            return auth.split(" ")[1];
        } else if (req.query
                && req.query.token) {
            return req.query.token;
        }
        return null;
    }
    var publicEndpoints = ["", "/", "/login", "/signup"];
    router.use("/", expressJwt({
        secret: cfg.jwt.secret,
        isRevoked: function isRevokedCallback(req, payload, done) {
            var token = getTokenFromRequest(req);
            jwt.verify(token, cfg.jwt.secret, function(err, decoded) {
                if (err) {return done(err); }
                return done(null, !decoded);
            });
        }}).unless({
        path: _.map(publicEndpoints, _.curry(append)(routePrefix))
    }));
    router.use(function catchTokenExpirationErrors(err, req, res, next) {
        if (err.name === "TokenExpiredError") {
            return res.status(401).json({error: err.name});
        }
        next();
    });

    router.get("/", function(req, res) {
        log.info("GET - Get all users");
        User.findAll().then(function(dbData) {
            var users = _.invoke(dbData, "get");
            res.json({users: users});
        });
    });

    function onValidUser(user, res) {
        var publicUserInfo = _.pick(user, ["username", "email"]);
        var token = "Bearer " + jwt.sign(publicUserInfo, cfg.jwt.secret, {
            issuer: "UniBull",
            expiresInSeconds: cfg.jwt.timeoutInSeconds
        });
        //TODO: Put token in Authorization header
        res.json({
            token: token,
            user: publicUserInfo,
            redirect: "/home"
        });
    }

    router.post("/login", function(req, res) {
        log.info("POST - Authenticate");
        User.find({where: {
            username: req.body.username
        }}).then(function(user) {
            if (user == null) {
                return res.status(401)
                    .json({error: "Failed to Authenticate"});
            }
            UserModel.isValidUser(user.password_hash, req.body.password,
                    function(err, isValid) {
                        if (err || !isValid) {
                            return res.status(401)
                                .json({error: "Failed to Authenticate"});
                        }
                        onValidUser(user, res);
                    });
        });
    });

    router.get("/restricted", function(req, res) {
        log.info("GET - Restricted");
        var token = getTokenFromRequest(req);
        res.json({
            success: true,
            decoded: jwt.decode(token)
        });
    });

    router.post("/signup", function(req, res) {
        User.create({
            username: req.body.username,
            password: req.body.password,
            email: req.body.email
        }).error(function(err) {
            if (err) {
                res.json({error: err.message});
            }
        }).then(_.partialRight(onValidUser, res));
    });

    return User.sync({force: !cfg.isProd}).then(function() {
        return User.create({
            username: "FirstUser",
            password: "mypasswd",
            email: "first.user@email.com"
        });
    }).then(function() {
        return callback(router);
    });
};
