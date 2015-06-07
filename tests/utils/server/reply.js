"use strict";

module.exports = function(UTILS, agent) {
    var utils = {};
    var chai = require("chai");
    chai.should();
    var _ = require("lodash");

    utils.validUser = UTILS.validUser;

    utils.makeNewReply = function() {
        var id = _.uniqueId();
        return {
            content: "reply_content_"+id
        };
    };

    utils.getReplies = function(classID, threadID) {
        return agent
            .get("/rest/class/"+classID+"/thread/"+threadID+"/all")
            .toPromise();
    };

    utils.replyToThread = function(classID, threadID, reply) {
        return agent
            .post("/rest/class/"+classID+"/thread/"+threadID+"/reply")
            .send(reply)
            .toPromise();
    };

    utils.replyToReply = function(classID, threadID, replyID, reply) {
        return agent
            .post("/rest/class/"+classID+"/thread/"+threadID+"/reply/"+replyID+"/reply")
            .send(reply)
            .toPromise();
    };

    utils.editReply = function(classID, threadID, replyID, reply) {
        return agent
            .put("/rest/class/"+classID+"/thread/"+threadID+"/reply/"+replyID+"/edit")
            .send(reply)
            .toPromise();
    };

    utils.deleteReply = function(classID, threadID, replyID) {
        return agent
            .delete("/rest/class/"+classID+"/thread/"+threadID+"/reply/"+replyID+"/delete")
            .toPromise();
    };

    utils.flagReply = function(classID, threadID, replyID, reason) {
        return agent
            .post("/rest/class/"+classID+"/thread/"+threadID+"/reply/"+replyID+"/flag")
            .send(reason)
            .toPromise();
    };

    return utils;
};
