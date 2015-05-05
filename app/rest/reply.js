"use strict";
var Promise = require("sequelize").Promise;

module.exports = function(dbModels) {
    var express = require("express");
    var router = express.Router();
    var bodyParser = require("body-parser");
    router.use(bodyParser.json());

    var _ = require("lodash");
    var cfg = require("../../config");
    var log = cfg.log.makeLogger("rest,reply");

    var User = dbModels.User;
    var Class = dbModels.Class;
    var Reply = dbModels.Reply;
    router.post("/:classID/thread/:threadID/reply", function(req, res) {
        log.info("POST - Reply to a thread");
        var classID = req.params.classID;
        var threadID = req.params.threadID;
        log.debug("classID", classID);
        log.debug("threadID", threadID);
        // Verify req body
        // Find the class
        Class.find({where: {title: classID}}).bind({}).then(function(klass) {
            // Find the thread
            return klass.getThreads({where: {title: threadID}});
        }).then(function(threads) {
            var thread = threads[0];
            this.thread = thread;
            // Create the reply
            return Reply.create({
                content: req.body.content
            }).then(function(reply) {
                // Add the reply to the thread
                return thread.addReply(reply);
            });
        }).then(function(reply) {
            this.reply = reply;
            // Save the thread, then return the class replies list
            return this.thread.getReplies({raw: true});
        }).then(function(replies) {
            this.replies = replies;
            // Find the user, add the reply to his list
            var auth = require("../auth.js");
            var username = auth.decodeRequest(req).username;
            return User.find({where: {username: username}}).bind(this).then(function(user) {
                this.user = user;
                return user.addReply(this.reply);
            });
        }).then(function() {
            return this.user.getReplies({raw: true});
        }).then(function(replies) {
            // Return res with replies list
            return res.json({
                replies: replies,
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
