"use strict";
var Promise = require("sequelize").Promise;

module.exports = function(dbModels) {
    var express = require("express");
    var router = express.Router();
    var bodyParser = require("body-parser");
    router.use(bodyParser.json());

    var _ = require("lodash");
    var auth = require("../auth.js");
    var cfg = require("../../config");
    var log = cfg.log.makeLogger("rest,class");

    var Class = dbModels.Class;
    var Thread = dbModels.Thread;
    var User = dbModels.User;

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
            });
        }).then(function(user) {
            // Verify user is found
            if (!user) {
                throw Error(cfg.errmsgs.invalidUserInfo);
            }
            this.user = user;
            return user.getClasses({where: {title: classID}});
        }).then(function(klass) {
            // Verify user is enrolled
            if (!_.contains(klass[0].get(), classID)) {
                throw Error(cfg.errmsgs.userNotEnrolled);
            }
        }).then(function() {
            return Thread.create({
                title: title,
                content: content
            });
        }).then(function(thread) {
            this.thread = thread;
            return this.class.addThread(thread);
        }).then(function() {
            return this.user.addThread(this.thread);
        }).then(function() {
            return this.class.getThreads({}, {raw: true});
        }).then(function(threads) {
            return res.json({
                threads: threads,
                action: "refresh"
            });
        }).catch(function(err) {
            return res.status(400).json({
                error: err.message
            });
        });
    });

    return Promise.resolve(router);
};
