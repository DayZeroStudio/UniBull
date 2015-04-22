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

describe("testing front end sign up", function() {
    this.timeout(1000*60*15);//== 15 minutes
    var client = {};
    var PORT = 9091;
    var baseUrl = "http://localhost:" + PORT;
    before(function(done) {
        require("../../index.js")(PORT, function() {
            client = driver.remote(options);
            client.init(done);
        });
    });
    context("once on the sign up page", function() {
        it("should have content", function(done) {
            client.url(baseUrl + "/signup")
            .title(function(err, res) {
                if (err) {done(err); }
                res.value.should.contain("Signup");
            })
            .call(done);
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
