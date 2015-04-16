/*eslint curly:0, no-unused-vars:0, no-unused-expressions:0*/
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
describe("<"+routePrefix+">", function() {
    before(function(done) {
        require(".."+routePrefix)(routePrefix, function(router) {
            app.use(routePrefix, router);
            done();
        });
    });
    describe("get all users", function() {
        context("foo", function() {
            it("should return a list of all users", function(done) {
                request(app)
                    .get(routePrefix + "/")
                    .expect(200)
                    .expect(function(res) {
                        res.body.users.should.have.length(1);
                    }).end(done);
            });
        });
    });
    describe("after logging in", function() {
        context("with valid credentials", function() {
            var validUser = {
                username: "FirstUser",
                password: "mypasswd"
            };
            function loginToApp(callback) {
                request(app)
                    .post(routePrefix + "/login")
                    .send(validUser)
                    .expect(200)
                    .end(function(err, res) {
                        if (err) return callback(err);
                        callback(null, res.body);
                    });
            }
            it("returns a jwt token & a redirect to /home", function(done) {
                request(app)
                    .post(routePrefix + "/login")
                    .send(validUser)
                    .expect(200)
                    .expect("Content-Type", /json/)
                    .expect(function(res) {
                        res.body.token.should.exist;
                        if (!_.startsWith(res.body.token, "Bearer"))
                            return "token should start with 'Bearer '";
                        res.body.redirect.should.equal("/home");
                    }).end(function(err, res) {
                        if (err) return done(err);
                        done();
                    });
            });
            it("returns a valid jwt token", function(done) {
                function gotToken(err, body) {
                    if (err)
                        return done(err);
                    request(app)
                        .get(routePrefix+"/restricted")
                        .set("Authorization", body.token)
                        .expect(200)
                        .expect("Content-Type", /json/)
                        .expect(function(res) {
                            res.body.decoded.should
                                .include.keys(["username", "email"]);
                        }).end(done);
                }
                loginToApp(gotToken);
            });
            it("the token is invalidated after cfg.jwt.timeoutInSeconds", function(done) {
                var clock = sinon.useFakeTimers();
                function gotToken(err, body) {
                    if (err) return done(err);
                    clock.tick(cfg.jwt.timeoutInSeconds * 1000);
                    request(app)
                        .get(routePrefix+"/restricted")
                        .set("Authorization", body.token)
                        .expect(401, done);
                    clock.restore();
                }
                loginToApp(gotToken);
            });
        });
    });
    describe("after signing up", function() {
        context("with valid user info", function() {
            function signupNewUser(username, callback) {
                request(app)
                    .post(routePrefix + "/signup")
                    .send({
                        username: username,
                        password: "password",
                        email: username + "@email.com"})
                    .expect(200)
                    .expect(function(res) {
                        if (!_.startsWith(res.body.token, "Bearer"))
                            return "Token should start with 'Bearer'";
                        res.body.redirect.should.equal("/home");
                    }).end(function(err, res) {
                        if (err) return callback(err);
                        callback(null, res.body);
                    });
            }
            it("/signup should return a jwt token & a redirect to /home", function(done) {
                signupNewUser(_.uniqueId("newuser_"), function(err, body) {
                    if (err) return done(err);
                    request(app)
                        .get(routePrefix + "/restricted")
                        .set("Authorization", body.token)
                        .expect(200)
                        .end(done);
                });
            });
        });
    });
});
