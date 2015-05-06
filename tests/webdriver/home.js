"use strict";

var chai = require("chai");
chai.should();
var driver = require("webdriverio");

var Promise = require("bluebird");

var cfg = require("../../config");

cfg.coverage();
describe("testing front end home page", function() {
    this.timeout(cfg.webdriver.timeout);
    var client = {};
    var utils = {};
    var PORT = 9092;// Make sure is unique
    var baseUrl = "http://localhost:" + PORT;
    before(function() {
        return require("../../index.js")(PORT).then(function() {
            client = driver.remote(cfg.webdriver.options);
            utils = require("../utils").wd(baseUrl).user(client);
            Promise.promisifyAll(client, {suffix: "_async"});
            return client.init_async();
        });
    });
    after(function() {
      return client.end();
    });
    context("once on the home page", function() {
        it("should have content", function() {
            utils.loginWithUser(utils.validUser);
            return client.saveScreenshot(cfg.screenshot.at("valid"))
                .title_async().then(function(res) {
                    res.value.should.contain("Home");
                });
            });
    });
    context("when the user wants to go to a different page", function() {
        context("clicking on the classes button", function() {
            it("should take you to the classes page", function() {
                utils.loginWithUser(utils.validUser);
                client.title_async().then(function(res) {
                    res.value.should.contain("Home");
                    client.click("#toclass")
                    .waitForExist("#toclass", 500, true)
                    .then(function(res) {
                        res.value.should.contain("Classes");
                    });
                });
            });
        });
    });
});
