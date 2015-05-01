"use strict";
var Promise = require("sequelize").Promise;

module.exports = Promise.promisify(function(dbModels, routePrefix, callback) {
    var express = require("express");
    var router = express.Router();
    var bodyParser = require("body-parser");
    router.use(bodyParser.json());

    var _ = require("lodash");
    function append(a, b) {return a+b; }
    var cfg = require("../../config");
    var log = cfg.log.makeLogger("rest,class");

    var auth = require("../auth.js");
    var publicEndpoints = _.map(["", "/"],
            _.partial(append, routePrefix))
            .concat([/all$/, /\/reply/]);
    auth.setupAuth(router, publicEndpoints);

    var Class = dbModels.Class;
    var Thread = dbModels.Thread;
    var User = dbModels.User;

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

    router.get("/:classID/all", function(req, res) {
        log.info("GET - Get all threads");
        var classID = req.params.classID;
        Class.find({
            where: {title: classID}
        }).then(function(klass) {
            return klass.getThreads();
        }).then(function(threads) {
            return res.json({
                threads: threads
            });
        });
    });

    router.post("/:classID/submit", function(req, res) {
        log.info("POST - Submit a new thread to :classID");
        var title = req.body.title;
        var content = req.body.content;
        var classID = req.params.classID;
        Class.find({
            where: {title: classID}
        }).bind({}).then(function(klass) {
            if (!content || !title) {
                throw Error(cfg.errmsgs.missingReqInfo);
            }
            this.class = klass;
        }).then(function() {
            // Get the user
            var decoded = auth.decodeRequest(req);
            var username = decoded.username;
            // check user is enrolled in :classID
            return User.find({where:
                {username: username}
            }, {raw: true});
        }).then(function(user) {
            if (!user) {
                throw Error(cfg.errmsgs.invalidUserInfo);
            }
            if (!_.contains(user.classes, classID)) {
                throw Error(cfg.errmsgs.userNotEnrolled);
            }
        }).then(function() {
            return Thread.create({
                title: title,
                content: content
            });
        }).then(function(thread) {
            return this.class.addThread(thread);
        }).then(function() {
            return this.class.getThreads({}, {raw: true});
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
