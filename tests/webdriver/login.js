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

cfg.coverage();
describe("testing front end login", function() {
    this.timeout(cfg.webdriver.timeout);
    var client = {};
    var utils = {};
    var PORT = 9090;// Make sure is unique
    var baseUrl = "http://localhost:" + PORT;
    before(function() {
        return require("../../index.js")(PORT).then(function() {
            client = driver.remote(options);
            utils = require("../utils").wd(baseUrl).user(client);
            Promise.promisifyAll(client, {suffix: "_async"});
            client.init();
        });
    });
    // Reset state, eg: always start at baseUrl
    beforeEach(function() {
        return client.url_async(baseUrl);
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
            utils.loginWithUser({});
            client.saveScreenshot(cfg.screenshot.at("empty"))
                .title_async().then(function(res) {
                    res.value.should.contain("Login");
                });
        });
    });
    context("when the user clicks login with valid credentials", function() {
        it("should authenticate and go to home page", function() {
            utils.loginWithUser(utils.validUser);
            client.saveScreenshot(cfg.screenshot.at("valid"))
                .title_async().then(function(res) {
                    res.value.should.contain("Home");
                });
        });
    });
});
