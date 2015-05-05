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
describe("testing front end home page", function() {
    this.timeout(cfg.webdriver.timeout);
    var client = {};
    var utils = {};
    var PORT = 9092;// Make sure is unique
    var baseUrl = "http://localhost:" + PORT;
    before(function() {
        return require("../../index.js")(PORT).then(function() {
            client = driver.remote(options);
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
});
