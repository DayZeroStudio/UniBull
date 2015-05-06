"use strict";

module.exports = function(UTILS, baseUrl, client) {
    var utils = {};
    var _ = require("lodash");

    utils.validUser = UTILS.validUser;

    utils.makeNewUser = function() {
        var id = _.uniqueId();
        return {
            username: "user_"+id,
            email: "email_"+id,
            password: "password_"+id
        };
    };

    utils.loginWithUser = function(user) {
        client.url(baseUrl)
            .setValue("#username", user.username || "")
            .setValue("#password", user.password || "")
            .click("#loginButton")
            .waitForExist("#loginButton", 500, true);
    };

    utils.signupWithUser = function(user) {
        return client.url(baseUrl+"/signup")
            .setValue("#username", user.username)
            .setValue("#email", user.email)
            .setValue("#password", user.password)
            .setValue("#confirmpassword", user.password)
            .click("#submit")
            .waitForExist("#submit", 100, true)
            .title_async().then(function(res) {
                return res.value;
            });
    };

    utils.goToClassPage = function() {
        return client.url(baseUrl+"/home")
            .click("#toclass")
            .waitForExist("#toclass", 500, true);
    };

    return utils;
};
