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

require("blanket")();
describe("testing front end home page", function() {
  this.timeout(cfg.webdriver.timeout);
  var client = {};
  var PORT = 9090;
  //var baseUrl = "http://localhost:/home" + PORT;
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
});
