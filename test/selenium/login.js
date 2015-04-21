/*eslint no-unused-vars:0*/
"use strict";

var chai = require("chai");
chai.should();
var driver = require("webdriverio");

var cfg = require("../../config");
var log = cfg.log.logger;

var options = {
    desiredCapabilities: {
        browserName: "firefox"
    }
};

describe("testing front end login", function() {
    this.timeout(9999999);
    var client = {};
    before(function(done) {
        require("../../index.js")(9090, function() {
            client = driver.remote(options);
            client.init(done);
        });
    });
    context("#sanitycheck", function() {
        it("should have content", function(done) {
            client.url("localhost:9090")
            .title(function(err, res) {
                if (err) {done(err); }
                res.value.should.contain("Login");
            }).click("#signupButton")
            .title(function(err, res) {
                if (err) {done(err); }
                res.value.should.contain("Signup");
                return done();
            });
        });
    });
    after(function(done) {
        client.end(done);
    });
});
