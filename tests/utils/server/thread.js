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
            .post("/rest/class/"+classID+"/submit")
            .send(thread)
            .toPromise();
    };

    return utils;
};
