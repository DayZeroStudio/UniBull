"use strict";

module.exports = function(UTILS, agent) {
    var utils = {};
    var chai = require("chai");
    chai.should();
    var _ = require("lodash");

    utils.validUser = UTILS.validUser;

    utils.makeNewClass = function() {
        var id = _.uniqueId();
        return {
            info: "info_"+id,
            school: "school_"+id,
            title: "title_"+id
        };
    };

    utils.createClass = function(klass) {
        return agent
            .post("/rest/class/create")
            .send(klass)
            .toPromise();
    };

    utils.joinClass = function(userID, classID) {
        return agent
            .post("/rest/user/"+ userID +"/joinClass")
            .send({classID: classID})
            .toPromise();
    };

    return utils;
};
