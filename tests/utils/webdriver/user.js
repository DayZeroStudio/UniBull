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
        return client.url(baseUrl).then(function() {
            return client
                .setValue("#username", user.username || "")
                .setValue("#password", user.password || "")
                .click("#submit")
                .waitForExist("#submit", 500, true);
        });
    };

    utils.signupWithUser = function(user) {
        return client.url(baseUrl+"/signup")
            .setValue("#username", user.username)
            .setValue("#email", user.email)
            .setValue("#password", user.password)
            //.setValue("#confirmpassword", user.password)
            .click("#submit")
            .waitForExist("#submit", 500, true)
            .title().then(function(res) {
                return res.value;
            });
    };

    return utils;
};
