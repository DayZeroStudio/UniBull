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
    var jwt = require("jsonwebtoken");

    // App
    var UserModel = require("../models/user");
    var User = UserModel.dbModel;
    var cfg = require("../config");
    var log = cfg.log.logger;

    var publicEndpoints = _.map(["", "/", "/login", "/signup"],
            _.partial(append, routePrefix));
    require("../app/auth.js").setupAuth(router, publicEndpoints);

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
        res.set({"Authorization": token}).json({
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
        var auth = require("../app/auth.js");
        res.json({
            success: true,
            decoded: auth.decodeRequest(req)
        });
    });

    router.post("/signup", function(req, res) {
        User.create({
            username: req.body.username,
            password: req.body.password,
            email: req.body.email
        }).then(_.partialRight(onValidUser, res))
        .catch(function(err) {
            if (err) {
                res.json({error: err.message});
            }
        });
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
