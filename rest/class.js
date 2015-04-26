"use strict";
var Promise = require("sequelize").Promise;

module.exports = Promise.promisify(function(models, routePrefix, callback) {
    var express = require("express");
    var router = express.Router();
    var bodyParser = require("body-parser");
    router.use(bodyParser.json());

    var _ = require("lodash");
    function append(a, b) {return a+b; }
    var cfg = require("../config");
    var log = cfg.log.logger;

    var auth = require("../app/auth.js");
    var publicEndpoints = _.map(["", "/"],
            _.partial(append, routePrefix));
    auth.setupAuth(router, publicEndpoints);

    var Class = models.Class;
    var Thread = models.Thread;
    var User = models.User;

    router.get("/", function(req, res) {
        log.info("GET - Get all classes");
        Class.findAll({
            include: [Thread]
        }).then(function(classes) {
            res.json({
                classes: classes
            });
        });
    });

    router.post("/create", function(req, res) {
        log.info("POST - Create a class");
        Class.findOrCreate({
            where: {
                title: req.body.title
            }, defaults: {
                info: req.body.info,
                school: req.body.school
            }
        }).spread(function(klass, created) {
            if (!created) {//ie found it
                return res.json({
                    error: "Class already exists",
                    redirect: "/class/"+klass.title
                });
            }
            return res.json({
                class: klass.get(),
                redirect: "/class/"+klass.title
            });
        }).catch(function(err) {
            res.json({error: err.message});
        });
    });

    router.post("/:classID/submit", function(req, res) {
        log.info("POST - Submit a post to :classID");
        var title = req.body.title;
        var content = req.body.content;
        var classID = req.params.classID;
        Class.find({
            where: {title: classID}
        }).then(function(klass) {
            if (!content || !title) {
                throw Error("did not submit all required information");
            }
            return klass;
        }).then(function(klass) {
            // Get the user
            var decoded = auth.decodeRequest(req);
            var username = decoded.username;
            // check user is enrolled in :classID
            return [klass, User.find({where:
                {username: username}
            }, {raw: true})];
        }).spread(function(klass, user) {
            if (!user) {
                throw Error("user was not found");
            }
            if (!_.contains(user.classes, classID)) {
                throw Error("user is not enrolled that class");
            }
            return klass;
        }).then(function(klass) {
            return [klass, Thread.create({
                title: title,
                content: content
            })];
        }).spread(function(klass, thread) {
            return [klass, klass.addThread(thread)];
        }).spread(function(klass) {
            return klass.getThreads({}, {raw: true});
        }).then(function(threads) {
            return res.json({
                threads: threads,
                action: "refresh"
            });
        }).catch(function(err) {
            return res.json({
                error: err.message
            });
        });
    });

    return callback(null, router);
});
