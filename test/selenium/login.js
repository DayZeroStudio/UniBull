/*
login w/ valid credentials gets you to home
invalid credentials -> ?? stay on login
straight to home invalid
*/
/*eslint no-unused-vars:0*/
"use strict";

var chai = require("chai");
chai.should();
var driver = require("webdriverio");

var cfg = require("../../config");
var log = cfg.log.logger;

var options = {
    port: cfg.webdriver.server.port,
    desiredCapabilities: {
        browserName: cfg.webdriver.name
    }
};

describe("testing front end login", function() {
    this.timeout(1000*60*15);//== 15 minutes
    var client = {};
    var PORT = 9090;
    var baseUrl = "http://localhost:" + PORT;
    before(function(done) {
        require("../../index.js")(PORT, function() {
            client = driver.remote(options);
            client.init(done);
        });
    });
    context("once on the login page", function() {
        it("should have content", function(done) {
            client.url(baseUrl)
            .title(function(err, res) {
                if (err) {done(err); }
                res.value.should.contain("Login");
            }).click("#signupButton")
            .title(function(err, res) {
                if (err) {done(err); }
                res.value.should.contain("Signup");
                return done();
            });
        });
    });
    context("when the user clicks login with invalid credentials", function() {
        it("should do nothing..", function(done) {
            client.url(baseUrl)
                .setValue("#username", "")
                .setValue("#password", "")
                .click("#loginButton")
                .saveScreenshot(cfg.genScreenshotPath("login_empty"))
                .title(function(err, res) {
                    if (err) {done(err); }
                    res.value.should.contain("Login");
                })
                .call(done);
        });
    });
    context("when the user clicks login with valid credentials", function() {
        it("should authenticate and go to home page", function(done) {
            var username = "FirstUser";
            var password = "mypasswd";
            client.url(baseUrl)
                .setValue("#username", username)
                .setValue("#password", password)
                .click("#loginButton")
                .saveScreenshot(cfg.genScreenshotPath("login_valid"))
                .title(function(err, res) {
                    if (err) {done(err); }
                    res.value.should.contain("Home");
                })
                .call(done);
        });
    });
    after(function(done) {
        client.end(done);
    });
});
