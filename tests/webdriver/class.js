"use strict";

var chai = require("chai");
chai.should();
var driver = require("webdriverio");

var Promise = require("bluebird");

var cfg = require("../../config");
var log = cfg.log.makeLogger("comma,tags");

require("blanket")();
describe("testing front end class page", function() {
  this.timeout(cfg.webdriver.timeout);
  var client = {};
  var utils = {};
  var PORT = 9093;// Make sure is unique
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
    context("given that you're logged in", function() {
        beforeEach(function() {
            utils.loginWithUser(utils.validUser);
            utils.goToClassPage();
        });
        context("once on the classes page", function() {
            it("should have content", function() {
                return client.title_async().then(function(res) {
                    res.value.should.contain("Classes");
                });
            });
            context("clicking links should redirect you appropriately", function() {
                it("home goes to home", function() {
                    return client.click("#home")
                        .waitForExist("#home", 500, true)
                        .title_async().then(function(res) {
                            res.value.should.contain("Home");
                        });
                });
                //other link tests
            });
            context("when the user clicks add a new class", function() {
                it("should display the form", function() {
                    return client.click("#addclass")
                        .waitForVisible("#submit_wrapper")
                        .then(function(res) {
                            res.should.equal(true);
                        });
                });
            });
            // context("when the user submits the new class form", function() {
            //     context("with valid info", function() {
            //         it("should add the class to available links", function() {
            //             client.click("#addclass")
            //             .setValue("#title", "TestClassTitle")
            //             .setValue("#info", "TestClassInfo")
            //             .setValue("#school", "TestClassUniversity")
            //             .click("#submit_class");
            //         });
            //     });
            // });
        });
    });
});
