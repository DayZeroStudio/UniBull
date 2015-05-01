"use strict";

module.exports = function(UTILS, request, app) {
    var utils = {};
    //var _ = require("lodash");

    utils.validUser = UTILS.validUser;

    utils.replyToThread = function(threadID, reply) {
        return request(app)
            .post("/rest/class/"+"WebDev101"+"/thread/"+threadID+"/reply")
            .send(reply)
            .toPromise();
    };

    return utils;
};
