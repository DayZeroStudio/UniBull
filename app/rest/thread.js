"use strict";
module.exports = function(dbModels) {
    var Promise = require("bluebird");
    var express = require("express");
    var router = express.Router();
    var bodyParser = require("body-parser");
    router.use(bodyParser.json());

    var auth = require("../auth.js");
    var cfg = require("../../config");
    var log = cfg.log.makeLogger("rest,class");

    var Class = dbModels.Class;
    var Thread = dbModels.Thread;
    //var Reply = dbModels.Reply;
    var User = dbModels.User;

    router.get("/:classID/all", function(req, res) {
        log.info("GET - Get all threads");
        var classID = req.params.classID;
        Class.find({
            where: {title: classID}
        }).then(function(klass) {
            return Thread.findAll({
                where: {ClassUuid: klass.get().uuid}
            }, {include: [{all: true, nested: true}]});
        }).then(function(threads) {
            return res.json({
                threads: threads
            });
        });
    });
    router.get("/:classID/thread/:threadID", function(req, res) {
        log.info("GET - Get a specific thread");
        var classID = req.params.classID;
        var threadID = req.params.threadID;
        Class.find({
            where: {title: classID}
        }).then(function(klass) {
            return klass.getThreads({
                where: {title: threadID}
            });
        }).then(function(threads) {
                return threads[0];
        }).then(function(thread) {
            return res.json({
                thread: thread
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
            if (klass.length === 0) {
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
            return this.thread.setUser(this.user);
        }).then(function() {
            return this.class.getThreads({}, {raw: true});
        }).then(function(threads) {
            return res.json({
                threads: threads,
                thread: this.thread,
                action: "refresh"
            });
        }).catch(function(err) {
            return res.status(400).json({
                error: err.message,
                stack: err.stack
            });
        });
    });

    //takes in thread uuid, and class title
    router.put("/:classID/thread/:threadID/edit", function(req, res) {
        log.info("PUT - editing a thread");
        console.log(req.body);
        var content = req.body.content;
        var title = req.body.title;
        //var title = req.params.classID;
        var classID = req.params.classID;
        var threadID = req.params.threadID;
        Class.find({
            where: {title: classID}
        }).bind({}).then(function(klass) {
            this.class = klass;
        }).then(function() {
            var decoded = auth.decodeRequest(req);
            var username = decoded.username;
            return User.find({
                where: {username: username}
            });
        }).then(function(user) {
            if (!user) {
                throw Error(cfg.errmsgs.invalidUserInfo);
            }
            this.user = user;
        }).then(function() {
            return this.class.getThreads({
                where: {uuid: threadID}
            });
        }).then(function(threads) {
            var thread = threads[0];
            if (this.user.uuid !== thread.UserUuid) {
                throw Error(cfg.errmsgs.naughtyUser);
            }
            thread.content = content;
            thread.title = title;
            return thread.save();
        }).then(function(thread) {
            return res.json({
                thread: thread
            });
        }).catch(function(err) {
            console.log(err);
            return res.status(400).json({
                error: err.message,
                stack: err.stack
            });
        });
    });

    router.delete("/:classID/thread/:threadID/delete", function(req, res) {
        log.info("DELETE - deleting a thread");
        var classID = req.params.classID;
        var threadID = req.params.threadID;
        Class.find({
            where: {title: classID}
        }).bind({}).then(function(klass) {
            this.class = klass;
        }).then(function() {
            var decoded = auth.decodeRequest(req);
            var username = decoded.username;
            return User.find({
                where: {username: username}
            });
        }).then(function(user) {
            if (!user) {
                throw Error(cfg.errmsgs.invalidUserInfo);
            }
            this.user = user;
        }).then(function() {
            return this.class.getThreads({
                where: {uuid: threadID}
            });
        }).then(function(threads) {
            var thread = threads[0];
            if (this.user.uuid !== thread.UserUuid) {
                throw Error(cfg.errmsgs.naughtyUser);
            }
            return thread.destroy();
        }).then(function() {
            return res.json({
                success: true
            });
        }).catch(cfg.handleErr(res));
    });

    router.post("/:classID/thread/:threadID/flag", function(req, res) {
        log.info("POST - flagging a thread");
        var classID = req.params.classID;
        var threadID = req.params.threadID;
        var reason = req.body.reason;
        Class.find({
            where: {title: classID}
        }).bind({}).then(function(klass) {
            this.class = klass;
        }).then(function() {
            return this.class.getThreads({
                where: {title: threadID}
            });
        }).then(function(threads) {
            var thread = threads[0];
            if (!thread.flagged) {
                thread.flagged = [];
            }
            thread.flagged.push(reason);
            return thread.save();
        }).then(function(thread) {
            return res.json({
                thread: thread
            });
        });
    });

    return Promise.resolve(router);
};
