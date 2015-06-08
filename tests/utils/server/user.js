"use strict";

module.exports = function(UTILS, agent) {
    var utils = {};
    var chai = require("chai");
    chai.should();
    var _ = require("lodash");

    utils.validUser = UTILS.validUser;
    utils.validInstructor = UTILS.validInstructor;

    utils.makeNewUser = function() {
        var name = _.uniqueId("newuser_");
        return {
            username: name,
            password: "password",
            email: name + "@email.com"
        };
    };

    utils.makeInstructor = function() {
        var name = _.uniqueId("newInstructor_");
        return {
            username: name,
            password: "password",
            email: name + "@email.com",
            role: "professor"
        };
    };

    utils.loginToApp = function(user) {
        return agent
            .post("/rest/user/login")
            .send(user)
            .toPromise();
    };

    utils.signupNewUser = function(user) {
        return agent
            .post("/rest/user/signup")
            .send(user)
            .toPromise();
    };

    utils.getUserInfo = function(userID) {
        return agent
            .get("/rest/user/"+ userID)
            .toPromise();
    };

    return utils;
};
