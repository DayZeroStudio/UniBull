"use strict";

module.exports = function(UTILS, request, app) {
    var utils = {};
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
        return request(app)
            .post("/rest/user/login")
            .send(user)
            .toPromise();
    };

    utils.signupNewUser = function(user) {
        return request(app)
            .post("/rest/user/signup")
            .send(user)
            .expect(200)
            .toPromise();
    };

    return utils;
};
