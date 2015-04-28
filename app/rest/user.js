"use strict";
var Promise = require("sequelize").Promise;

module.exports = Promise.promisify(function(dbModels, routePrefix, callback) {
    var express = require("express");
    var router = express.Router();
    var bodyParser = require("body-parser");
    router.use(bodyParser.json());

    var _ = require("lodash");
    function append(a, b) {return a+b; }
    var jwt = require("jsonwebtoken");

    var cfg = require("../../config");
    var log = cfg.log.logger;

    var auth = require("../auth.js");
    var publicEndpoints = _.map(["", "/", "/login", "/signup"],
            _.partial(append, routePrefix));
    auth.setupAuth(router, publicEndpoints);

    var User = dbModels.User;
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
            User.isValidUser(user.password_hash, req.body.password)
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

    router.post("/signup", function(req, res) {
        User.create({
            username: req.body.username,
            password: req.body.password,
            email: req.body.email
        }).then(_.partialRight(onValidUser, res))
        .catch(function(err) {
            res.json({error: err.message});
        });
    });

    router.get("/:userID", function(req, res) {
        log.info("GET - Get user info");
        User.find({
            where: {username: req.params.userID}
        }).then(function(user) {
            return res.json({user: user});
        });
    });

    router.post("/:userID/joinClass", function(req, res) {
        log.info("POST - Join a class");
        var userID = req.params.userID;
        var classID = req.query.classID;
        User.find({
            where: {username: userID}
        }).then(function(user) {
            if (!user) {
                return res.json({error: "user not found"});
            }
            return user.addClass(classID);
        }).then(function(user) {
            return user.save();
        }).then(function(user) {
            return res.json({
                redirect: "/class/"+classID,
                classes: user.get().classes
            });
        }).catch(function(err) {
            return res.json({
                error: err
            });
        });
    });

    return User.create({
        username: "FirstUser",
        password: "mypasswd",
        email: "first.user@email.com"
    }).then(function() {
        return callback(null, router);
    });
});
