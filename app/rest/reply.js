"use strict";
var Promise = require("sequelize").Promise;

module.exports = function(dbModels/*, routePrefix*/) {
    var express = require("express");
    var router = express.Router();
    var bodyParser = require("body-parser");
    router.use(bodyParser.json());

    var cfg = require("../../config");
    var log = cfg.log.makeLogger("rest,reply");

    var auth = require("../auth.js");
    var publicEndpoints = [/\/reply/];
    auth.setupAuth(router, publicEndpoints);

    var Class = dbModels.Class;
    var Reply = dbModels.Reply;
    router.post("/:classID/thread/:threadID/reply", function(req, res) {
        log.info("POST - Reply to a thread");
        var classID = req.params.classID;
        var threadID = req.params.threadID;
        // Verify req body
        var reply = {
            content: req.body.content
        };
        // Find the class
        Class.find({where: {title: classID}}).bind({}).then(function(klass) {
            // Find the thread
            return klass.getThreads({where: {title: threadID}});
        }).then(function(threads) {
            var thread = threads[0];
            this.thread = thread;
            // Create the reply
            return Reply.create(reply).then(function(reply) {
                // Add the reply to the thread
                return [thread, thread.addReply(reply)];
            });
        }).spread(function(thread) {
            return thread.save().then(function(thread) {
                return thread.getReplies({raw: true});
            });
        }).then(function(replies) {
            // Return res with replies list
            return res.json({
                replies: replies,
                action: "refresh"
            });
        }).catch(function(err) {
            log.error(err);
            return res.status(400).json({
                error: err.message
            });
        });
    });

    return Promise.resolve(router);
};
