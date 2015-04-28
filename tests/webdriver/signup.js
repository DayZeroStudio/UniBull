/*eslint curly:0, no-unused-vars:0*/
"use strict";

var chai = require("chai");
chai.should();
var driver = require("webdriverio");

var Promise = require("sequelize").Promise;

var _ = require("lodash");
var cfg = require("../../config");
var log = cfg.log.logger;

var options = {
    port: cfg.webdriver.server.port,
    desiredCapabilities: {
        browserName: cfg.webdriver.name
    }
};

describe("testing front end sign up", function() {
    this.timeout(cfg.webdriver.timeout);
    var client = {};
    var PORT = 9091;
    var baseUrl = "http://localhost:" + PORT;
    before(function(done) {
        require("../../index.js")(PORT).then(function() {
            client = driver.remote(options);
            Promise.promisifyAll(client, {suffix: "_async"});
            client.init(done);
        });
    });
    context("once on the sign up page", function() {
        it("should have content", function(done) {
            client.pause(500)
                .url(baseUrl + "/signup")
                .saveScreenshot(cfg.genScreenshotPath("signup"))
                .title_async().then(function(res) {
                    res.value.should.contain("Signup");
                }).then(done);
        });
    });
    function makeNewUser() {
        var id = _.uniqueId();
        return {
            username: "user_"+id,
            email: "email_"+id,
            password: "password_"+id
        };
    }
    var signupWithUser = function(user) {
        return client.url(baseUrl + "/signup")
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
    context("when the user fills out the form", function() {
        it("should redirect you to home", function(done) {
            var user = makeNewUser();
            signupWithUser(user).then(function(title) {
                client.saveScreenshot(cfg.genScreenshotPath("submit"));
                title.should.contain("Home");
            }).then(done).catch(done);
        });
        it("should allow you to re-login as the new user", function(done) {
            var user = makeNewUser();
            signupWithUser(user).then(function() {
                return client.click("#logout")
                    .waitForExist("#logout", 100, true)
                    .title_async().then(function(res) {
                        res.value.should.contain("Login");
                    });
            }).then(function() {
                client.setValue("#username", user.username)
                    .setValue("#password", user.password)
                    .click("#loginButton")
                    .waitForExist("#loginButton", 500, true)
                    .title_async().then(function(res) {
                        res.value.should.contain("Home");
                    });
            }).then(done).catch(done);
        });
    });
    after(function(done) {
        client.end(done);
    });
});
