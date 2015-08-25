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
            info: "class_info_"+id,
            school: "class_school_"+id,
            title: "class_title_"+id
        };
    };

    utils.createClass = function(klass) {
        return agent
            .post("/api/class/create")
            .send(klass)
            .toPromise();
    };

    utils.joinClass = function(classID) {
        return agent
            .post("/api/user/joinClass")
            .send({classID: classID})
            .toPromise();
    };

    return utils;
};
