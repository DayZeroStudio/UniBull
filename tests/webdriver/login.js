"use strict";

var chai = require("chai");
chai.should();
var driver = require("webdriverio");

var Promise = require("bluebird");

var cfg = require("../../config");

var options = {
    port: cfg.webdriver.server.port,
    desiredCapabilities: {
        browserName: cfg.webdriver.name
    }
};

describe("testing front end login", function() {
    this.timeout(cfg.webdriver.timeout);
    var client = {};
    var PORT = 9090;
    var baseUrl = "http://localhost:" + PORT;
    before(function() {
        return require("../../index.js")(PORT).then(function() {
            client = driver.remote(options);
            Promise.promisifyAll(client, {suffix: "_async"});
            client.init();
        });
    });
    after(function() {
        return client.end();
    });
    context("once on the login page", function() {
        it("should have content", function() {
            return client.url(baseUrl)
                .title_async().then(function(res) {
                    res.value.should.contain("Login");
                }).then(function() {
                    client.click("#signupButton")
                        .waitForExist("#signupButton", 300, true)
                        .title_async().then(function(res) {
                            res.value.should.contain("Signup");
                        });
                });
        });
    });
    context("when the user clicks login with invalid credentials", function() {
        it("should do nothing..", function() {
            return client.url(baseUrl)
                .setValue("#username", "")
                .setValue("#password", "")
                .click("#loginButton")
                .saveScreenshot(cfg.screenshot.at("empty"))
                .title_async().then(function(res) {
                    res.value.should.contain("Login");
                });
        });
    });
    context("when the user clicks login with valid credentials", function() {
        it("should authenticate and go to home page", function() {
            var username = "FirstUser";
            var password = "mypasswd";
            return client.url(baseUrl)
                .setValue("#username", username)
                .setValue("#password", password)
                .click("#loginButton")
                .waitForExist("#loginButton", 500, true)
                .saveScreenshot(cfg.screenshot.at("valid"))
                .title_async().then(function(res) {
                    res.value.should.contain("Home");
                });
        });
    });
});
