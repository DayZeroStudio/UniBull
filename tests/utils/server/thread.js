"use strict";

module.exports = function(UTILS, agent) {
    var utils = {};
    var chai = require("chai");
    chai.should();
    var _ = require("lodash");

    utils.validUser = UTILS.validUser;

    utils.makeNewThread = function() {
        var id = _.uniqueId();
        return {
            title: "thread_title_" + id,
            content: "thread_content_" + id
        };
    };

    utils.submitThread = function(classID, thread) {
        return agent
            .post("/api/class/"+classID+"/submit")
            .send(thread)
            .toPromise();
    };

    utils.getAllThreads = function(classID) {
        return agent
            .get("/api/class/"+classID)
            .toPromise();
    };

    utils.getThread = function(classID, threadID) {
        return agent
            .get("/api/class/"+classID+"/thread/"+threadID)
            .toPromise();
    };

    utils.editThread = function(classID, threadID, content, title) {
        return agent
            .put("/api/class/"+classID+"/thread/"+threadID+"/edit")
            .send({
                title: title,
                content: content
            }).toPromise();
    };

    utils.deleteThread = function(classID, threadID) {
        return agent
            .delete("/api/class/"+classID+"/thread/"+threadID+"/delete")
            .toPromise();
    };

    utils.flagThread = function(classID, threadID, reason) {
        return agent
            .post("/api/class/"+classID+"/thread/"+threadID+"/flag")
            .send(reason)
            .toPromise();
    };

    utils.endorseThread = function(classID, threadID, reason) {
        return agent
            .post("/api/class/"+classID+"/thread/"+threadID+"/endorse")
            .send(reason)
            .toPromise();
    };

    return utils;
};
