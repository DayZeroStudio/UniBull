"use strict";

var chai = require("chai");
chai.should();
var driver = require("webdriverio");
var cfg = require("@config");

describe("testing front end home page", function() {
    this.timeout(cfg.webdriver.timeout);
    var client = {};
    var utils = {};
    var PORT = 9092;// Make sure is unique
    var baseUrl = "http://localhost:" + PORT;
    before(function() {
        return require("../../unibull.js")(PORT).then(function() {
            client = driver.remote(cfg.webdriver.options);
            utils = require("../utils").wd(baseUrl).user(client);
            return client.init();
        });
    });
    after(function() {
        return client.end();
    });
    context("once on the home page", function() {
        it("should have content", function() {
            return utils.loginWithUser(utils.validUser).then(function() {
                return client
                    .saveScreenshot(cfg.screenshot.at("valid"))
                    .title();
            }).then(function(res) {
                res.value.should.contain("Home");
            });
        });
    });
    context("when the user wants to go to a different page", function() {
        context("clicking on the classes button", function() {
            it("should take you to the classes page", function() {
                return utils.loginWithUser(utils.validUser).then(function() {
                    return client
                        .click("#nav-item-classes")
                        .waitForExist("#nav-item-classes", 500, true)
                        .title();
                }).then(function(res) {
                    res.value.should.contain("Classes");
                });
            });
        });
    });
});
