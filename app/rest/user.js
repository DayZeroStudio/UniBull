"use strict";
module.exports = function(dbModels, routePrefix) {
    var Promise = require("bluebird");

    var express = require("express");
    var router = express.Router();
    var bodyParser = require("body-parser");
    router.use(bodyParser.json());

    var _ = require("lodash");
    function append(a, b) {return a+b; }
    var jwt = require("jsonwebtoken");

    var cfg = require("../../config");
    var log = cfg.log.makeLogger("rest,user");

    var auth = require("../auth.js");
    var publicEndpoints = _.map(["", "/", "/login", "/signup"],
            _.partial(append, routePrefix));
    auth.setupAuth(router, publicEndpoints);

    var Class = dbModels.Class;
    var User = dbModels.User;
    var SecretCodes = dbModels.SignupCodes;

    router.get("/", function(req, res) {
        log.info("GET - Get all users");
        User.findAll().then(function(dbData) {
            var users = _.invoke(dbData, "get");
            return res.json({users: users});
        });
    });

    function onValidUser(user, res) {
        var publicUserInfo = _.pick(user, ["username", "email", "role"]);
        var token = "Bearer " + jwt.sign(publicUserInfo, cfg.jwt.secret, cfg.jwt.options);
        res.cookie("token", token).set({
            "Authorization": token
        }).json({
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
            user.isValidUser(req.body.password)
                .then(function() {
                    return onValidUser(user, res);
                }).catch(function() {
                    return res.status(401)
                        .json({error: "Failed to Authenticate"});
                });
        });
    });

    router.get("/restricted", function(req, res) {
        log.info("GET - Restricted");
        res.json({
            success: true,
            decoded: auth.decodeRequest(req)
        });
    });

    router.get("/admin", function(req, res) {
        var user = auth.decodeRequest(req);
        log.warn("user", user);
        log.warn("isAuthorizedFor", auth.isAuthorizedFor(user.role, "admin"));
        if (auth.isAuthorizedFor(user.role, "admin")) {
            return res.json({
                success: true
            });
        } else {
            return res.status(401).json({
                success: false
            });
        }
    });

    var confirmEmail = function(suffix) {
        return "unibulletin" + (suffix?"+"+suffix:"") + "@gmail.com";
    };
    var mailer = require("nodemailer");
    var transporter = Promise.promisifyAll(mailer.createTransport({
        service: "Gmail",
        auth: {
            user: confirmEmail(),
            pass: "unibull2000"
        }
    }));
    router.post("/signup", function(req, res) {
        log.info("POST - Signup user");
        log.warn("BODY:", req.body);
        var username = req.body.username;
        var password = req.body.password;
        var email = req.body.email;
        var role = req.body.role;
        User.findOrCreate({where: {
            username: username
        }, defaults: {
            password: password,
            email: email
        }}).bind({}).spread(function(user, created) {
            if (!created) {// ie: username taken
                throw Error(cfg.errmsgs.userAlreadyTaken);
            }
            this.user = user;
            if (role === "professor") {
                var crypto = Promise.promisifyAll(require("crypto"));
                return crypto.randomBytesAsync(48).then(function(buf) {
                    return buf.toString("base64").replace(/\//g, "_").replace(/\+/g, "-");
                }).then(function(secretCode) {
                    return SecretCodes.create({code: secretCode});
                }).get("code").then(function(secretCode) {
                    return transporter.sendMail({
                        from: confirmEmail(),
                        to: confirmEmail("signup.prof"),
                        subject: "Please confirm '"+email+"' as a prof",
                        html: email+"<br><a href='http://localhost:8080/rest/user/auth?code="+secretCode+"&role=professor'>Click when ready to confirm</a>"
                    });
                });
            }
        }).then(function() {
            return onValidUser(this.user, res);
        }).catch(cfg.handleErr(res));
    });

    router.get("/auth", function(req, res) {
        log.info("Auth user as req.query.role");
        var code = req.query.code;
        var role = req.query.role;
        SecretCodes.find({
            where: {code: code}
        }).then(function(foundCode) {
            if (!foundCode) {
                throw Error("how the fuck?");
            }
            //Delete code
            return foundCode.destroy();
        }).then(function() {
            //Update user as role
            var user = auth.decodeRequest(req);
            return User.find({where: {
                username: user.username
            }}).then(function(user) {
                user.role = role;
                return user.save();
            });
        }).then(function() {
            return res.json({
                fuck: "yeah"
            });
        }).catch(cfg.handleErr(res));
    });

    router.get("/:userID", function(req, res) {
        log.info("GET - Get user info");
        User.find({
            where: {username: req.params.userID},
            include: [{all: true, nested: true}]
        }).then(function(user) {
            var fullUser = _.omit(user.get(), "password_hash");
            return res.json(fullUser);
        }).catch(cfg.handleErr(res));
    });

    router.post("/:userID/joinClass", function(req, res) {
        log.info("POST - Join a class");
        var userID = req.params.userID;
        var classID = req.body.classID;
        User.find({
            where: {username: userID}
        }).bind({}).then(function(user) {
            if (!user) {
                throw Error(cfg.errmsgs.invalidUserInfo);
            }
            this.user = user;
            return Class.find({where: {uuid: classID}});
        }).then(function(klass) {
            this.class = klass;
            return this.user.hasClass(klass);
        }).then(function(alreadyEnrolled) {
            if (alreadyEnrolled) {
                throw Error(cfg.errmsgs.userAlreadyEnrolled(this.class.get().title));
            }
            return this.user.addClass(this.class);
        }).then(function() {
            return this.user.getClasses();
        }).then(function(classes) {
            return res.json({
                redirect: "/class/"+classID,
                classes: classes
            });
        }).catch(cfg.handleErr(res));
    });

    return Promise.resolve(router);
};
