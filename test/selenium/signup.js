/*eslint no-unused-vars:0*/
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
    context("when the user fills out the form", function() {
        it("should create a new user with given credentials", function(done) {
            var username = "TestUser";
            var email = "testemail@gmail.com";
            var password = "mypasswd";
            client.url(baseUrl + "/signup")
                .setValue("#username", username)
                .setValue("#email", email)
                .setValue("#password", password)
                .setValue("#confirmpassword", password)
                .click("#submit")
                .waitForExist("#submit", 100, true)
                .saveScreenshot(cfg.genScreenshotPath("submit"))
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
