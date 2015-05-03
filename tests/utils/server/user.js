"use strict";

module.exports = function(UTILS, agent) {
    var utils = {};
    var chai = require("chai");
    chai.should();
    var _ = require("lodash");

    utils.validUser = UTILS.validUser;

    utils.makeNewUser = function() {
        var name = _.uniqueId("newuser_");
        return {
            username: name,
            password: "password",
            email: name + "@email.com"
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

    return utils;
};
