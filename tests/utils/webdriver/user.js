"use strict";

module.exports = function(baseUrl, client) {
    var utils = {};
    var _ = require("lodash");

    utils.validUser = {
        username: "FirstUser",
        password: "mypasswd"
    };

    utils.makeNewUser = function() {
        var id = _.uniqueId();
        return {
            username: "user_"+id,
            email: "email_"+id,
            password: "password_"+id
        };
    };

    /**
     * loginWithUser
     * takes a user and logs in with its credentials
     */
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

    return utils;
};
