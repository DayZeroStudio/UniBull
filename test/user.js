/*eslint curly:0, no-unused-vars:0*/
"use strict";

var chai = require("chai");
chai.should();
var request = require("supertest");
var sinon = require("sinon");
var async = require("async");
var _ = require("lodash");

var app = require("express")();

var cfg = require("../config");
var log = cfg.log.logger;

var routePrefix = "/rest/user";
describe(routePrefix, function() {
    before(function(done) {
        require("../rest/user")(routePrefix, function(router) {
            app.use(routePrefix, router);
            done();
        });
    });
    describe("after logging in", function() {
        context("with valid credentials", function() {
            var validUser = {
                username: "FirstUser",
                password: "mypasswd"
            };
            var loginToApp = function(tokenCallback) {
                request(app)
                    .get(routePrefix + "/login")
                    .query(validUser)
                    .expect(200)
                    .end(function(err, res) {
                        if (err) return tokenCallback(err);
                        tokenCallback(null, res.body.token);
                    });
            };
            it("returns a jwt token", function(done) {
                request(app)
                    .get(routePrefix + "/login")
                    .query(validUser)
                    .expect(200)
                    .expect("Content-Type", /json/)
                    .expect(function(res) {
                        if (!_.has(res.body, "token"))
                            return "res.body is missing the token field";
                        if (!_.startsWith(res.body.token, "Bearer"))
                            return "token should start with 'Bearer '";
                    }).end(function(err, res) {
                        if (err) return done(err);
                        done();
                    });
            });
            it("returns a valid jwt token", function(done) {
                var gotToken = function(err, token) {
                    if (err)
                        return done(err);
                    request(app)
                        .get(routePrefix+"/stuff")
                        .set("Authorization", token)
                        .expect(200)
                        .expect({success: true}, done);
                };
                loginToApp(gotToken);
            });
            it("the token is invalidated after cfg.jwt.timeoutInSeconds", function(done) {
                var clock = sinon.useFakeTimers();
                var gotToken = function(err, token) {
                    if (err) return done(err);
                    clock.tick(cfg.jwt.timeoutInSeconds * 1000);
                    request(app)
                        .get(routePrefix+"/stuff")
                        .set("Authorization", token)
                        .expect(500, done);
                    clock.restore();
                };
                request(app)
                    .get(routePrefix + "/login")
                    .query(validUser)
                    .expect(200)
                    .end(function(err, res) {
                        if (err) return gotToken(err);
                        gotToken(null, res.body.token);
                    });
            });
        });
    });
});

