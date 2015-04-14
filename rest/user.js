module.exports = function(routePrefix, callback) {
    "use strict";
    var express = require("express");
    var router = express.Router();

    var bodyParser = require("body-parser");
    router.use(bodyParser.json());

    var DB = require("sequelize");

    var bcrypt = require("bcrypt");
    var expressJwt = require("express-jwt");
    var jwt = require("jsonwebtoken");

    var _ = require("lodash");
    var cfg = require("../config");
    var log = cfg.log.logger;

    var db = new DB(cfg.db.name, cfg.db.username, cfg.db.password, {
        dialect: "postgres",
        logging: (cfg.isTest ? _.identity : log.debug.bind(log))
    });
    var User = db.define("User", {
        username: {type: DB.STRING},
        password_hash: {type: DB.STRING},
        password: {
            type: DB.VIRTUAL,
            set: function(password) {
                this.setDataValue("password", password);
                var hashed = bcrypt.hashSync(password, 10);
                this.setDataValue("password_hash", hashed);
            },
            validate: {len: [7, 64]}
        },
        email: {type: DB.STRING}
    });

    var isRevokedCallback = function(req, payload, done) {
        var auth = req.headers.authorization;
        var token = auth.substr(auth.indexOf(" ")+1, auth.length);
        jwt.verify(token, cfg.jwt.secret, function(err, decoded) {
            if (err) {return done(err); }
            return done(null, !decoded);
        });
    };
    router.use("/", expressJwt({
        secret: cfg.jwt.secret,
        isRevoked: isRevokedCallback
    }).unless({path: _.map(["", "/", "/login"], function(route) {
        return routePrefix + route;
    })}));

    router.get("/", function(req, res) {
        log.info("GET - Get all users");
        User.findAll().then(function(dbData) {
            var users = _.chain(dbData)
                .map("dataValues");
            log.info({users: users});
            res.json({users: users});
        });
    });

    router.get("/login", function(req, res) {
        log.info("GET - Authenticate");
        User.find({where: {
            username: req.query.username
        }}).then(function(user) {
            if (user == null) {
                res.json({error: "Failed to Find user"});
                return;
            }
            bcrypt.compare(req.query.password, user.password_hash,
                    function(err, isValid) {
                        if (err) {
                            return res.json({error: err.message});
                        }
                        if (isValid) {
                            var userInfo = {
                                username: user.username,
                                email: user.email
                            };
                            var token = "Bearer "+jwt.sign(userInfo, cfg.jwt.secret, {
                                expiresInSeconds: cfg.jwt.timeoutInSeconds
                            });
                            //TODO: put token in Authorization header
                            res.json({token: token, user: userInfo});
                        } else {
                            res.json({error: "Failed to Authenticate"});
                        }
                    });
        });
    });

    router.get("/stuff", function(req, res) {
        log.info("GET - Stuff");
        res.json({success: true});
    });

    return User.sync({force: cfg.isDev}).then(function() {
        return User.create({
            username: "FirstUser",
            password: "mypasswd",
            email: "first.user@email.com"
        });
    }).then(function() {
        return callback(router);
    });
};

