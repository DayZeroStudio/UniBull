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
describe("testing front end sign up", function() {
    this.timeout(cfg.webdriver.timeout);
    var client = {};
    var utils = {};
    var PORT = 9091; // Make sure is unique
    var baseUrl = "http://localhost:" + PORT;
    before(function() {
        return require("../../index.js")(PORT).then(function() {
            client = driver.remote(options);
            utils = require("../utils").wd(baseUrl).user(client);
            Promise.promisifyAll(client, {suffix: "_async"});
            return client.init();
        });
    });
    after(function() {
        return client.end();
    });
    context("once on the sign up page", function() {
        it("should have content", function() {
            return client.pause(500)
                .url(baseUrl + "/signup")
                .saveScreenshot(cfg.screenshot.at("signup"))
                .title_async().then(function(res) {
                    res.value.should.contain("Signup");
                });
        });
    });
    context("when the user fills out the form", function() {
        it("should redirect you to home", function() {
            var user = utils.makeNewUser();
            return utils.signupWithUser(user).then(function(title) {
                client.saveScreenshot(cfg.screenshot.at("submit"));
                title.should.contain("Home");
            });
        });
        it("should allow you to re-login as the new user", function() {
            var user = utils.makeNewUser();
            return utils.signupWithUser(user).then(function() {
                return client.click("#logout")
                    .waitForExist("#logout", 100, true)
                    .title_async().then(function(res) {
                        res.value.should.contain("Login");
                    });
            }).then(function() {
                utils.loginWithUser(utils.validUser);
                client.title_async().then(function(res) {
                        res.value.should.contain("Home");
                    });
            });
        });
    });
});
