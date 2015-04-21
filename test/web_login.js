"use strict";

var chai = require("chai");
chai.should();
var request = require("supertest");
var cheerio = require("cheerio");

var app;

var cfg = require("../config");
var log = cfg.log.logger;

describe("testing front end login", function() {
    before(function(done) {
        require("../index.js")(9090, function(ubApp) {
            app = ubApp;
            done();
        });
    });
    context("#sanitycheck", function() {
        it("should have content", function(done) {
            request(app)
                .get("/")
                .expect(200)
                .expect(function(res) {
                    log.warn(res.text.length);
                    var $ = cheerio.load(res.text);
                    $("title").text().should.equal("UniBull Login Page");
                }).end(done);
        });
    });
});
