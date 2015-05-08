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
            content: "content_"+id
        };
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

    return utils;
};
