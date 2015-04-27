/*eslint curly:0, no-unused-vars:0*/
"use strict";

var chai = require("chai");
chai.should();
var driver = require("webdriverio");

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
            client.init(done);
        });
    });
    context("once on the sign up page", function() {
        it("should have content", function(done) {
            client.pause(500)
                .url(baseUrl + "/signup")
                .saveScreenshot(cfg.genScreenshotPath("signup"))
                .title(function(err, res) {
                    if (err) {done(err); }
                    res.value.should.contain("Signup");
                }).call(done);
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
    function signupWithUser(user, callback) {
        client.url(baseUrl + "/signup")
            .setValue("#username", user.username)
            .setValue("#email", user.email)
            .setValue("#password", user.password)
            .setValue("#confirmpassword", user.password)
            .click("#submit")
            .waitForExist("#submit", 100, true)
            .title(function(err, res) {
                if (err) return callback(err);
                return callback(null, client, res.body);
            });
    }
    context("when the user fills out the form", function() {
        it("should redirect you to home", function(done) {
            var user = makeNewUser();
            signupWithUser(user, function(err, client, body) {
                if (err) return done(err);
                client.saveScreenshot(cfg.genScreenshotPath("submit"))
                    .title(function(err, res) {
                    if (err) return done(err);
                    res.value.should.contain("Home");
                }).call(done);
            });
        });
        it("should allow you to re-login as the new user", function(done) {
            var user = makeNewUser();
            signupWithUser(user, function(err, client, body) {
                if (err) return done(err);
                client.click("#logout")
                    .waitForExist("#logout", 100, true)
                    .title(function(err, res) {
                        if (err) return done(err);
                        res.value.should.contain("Login");
                    }).setValue("#username", user.username)
                    .setValue("#password", user.password)
                    .click("#loginButton")
                    .waitForExist("#loginButton", 100, true)
                    .title(function(err, res) {
                        if (err) return done(err);
                        res.value.should.contain("Home");
                    }).call(done);
            });
        });
    });
    after(function(done) {
        client.end(done);
    });
});
