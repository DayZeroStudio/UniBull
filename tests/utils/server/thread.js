"use strict";

module.exports = function(UTILS, request, app) {
    var utils = {};
    var _ = require("lodash");

    utils.validUser = UTILS.validUser;

    utils.makeNewThread = function() {
        var id = _.uniqueId();
        return {
            title: "thread_title_" + id,
            content: "thread_content_" + id
        };
    };

    utils.submitThread = function(classID, token, thread) {
        return request(app)
            .post("/rest/class/"+classID+"/submit")
            .set("Authorization", token)
            .send(thread).expect(200)
            .toPromise();
    };

    return utils;
};
