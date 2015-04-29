"use strict";

var chai = require("chai");
var should = chai.should();
var request = require("supertest-as-promised");
var sinon = require("sinon");

var _ = require("lodash");

var express = require("express");
var app = express();
app.use(require("cookie-parser")());

var cfg = require("../../config");

describe("testing user endpoints", function() {
    before(function() {
        return require("../../db")().then(function(dbModels) {
            return require("../../app/rest")(dbModels)
                .then(function(router) {
                    app.use(router);
                });
        });
    });
    context("without authentication", function() {
        it("GET '/' should return a list of all users", function() {
            return request(app)
                .get("/rest/user/")
                .expect(200)
                .expect(function(res) {
                    res.body.users.should.have.length.above(0);
                }).toPromise();
        });
        it("POST '/restricted' should be unauthorized", function() {
            return request(app)
                .post("/rest/user/restricted")
                .expect(401)
                .expect(function(res) {
                    res.body.should.contain.keys("error");
                }).toPromise();
        });
    });
    describe("logging in", function() {
        function loginToApp(user) {
            return request(app)
                .post("/rest/user/login")
                .send(user)
                .toPromise();
        }
        context("with invalid credentials", function() {
            it("(none) should return an error", function() {
                return loginToApp({}).then(function(res) {
                    res.body.should.have.key("error");
                });
            });
            it("(only username) should return an error", function() {
                return loginToApp({
                    username: "FirstUser"
                }).then(function(res) {
                    res.body.should.have.key("error");
                });
            });
            it("(both) should return an error", function() {
                return loginToApp({
                    username: "FirstUser",
                    password: "imNotTheCorrectPassword"
                }).then(function(res) {
                    res.body.should.have.key("error");
                });
            });
        });
        context("with valid credentials", function() {
            var validUser = {
                username: "FirstUser",
                password: "mypasswd"
            };
            it("we are auth'd and redirected to '/home'", function() {
                return request(app)
                    .post("/rest/user/login")
                    .send(validUser)
                    .expect(200)
                    .expect("Content-Type", /json/)
                    .expect(function(res) {
                        should.exist(res.body.token);
                        res.body.token.should.match(/^Bearer/);
                        res.body.redirect.should.equal("/home");
                    }).toPromise();
            });
            it("we can view restricted pages", function() {
                return loginToApp(validUser).then(function gotToken(res) {
                    return request(app)
                        .get("/rest/user/restricted")
                        .set("Authorization", res.body.token)
                        .expect(200)
                        .expect(function(res) {
                            res.body.decoded.should
                                .contain.keys("username", "email");
                        }).toPromise();
                });
            });
            context("for a long enough time", function() {
                var timeout = cfg.jwt.timeoutInSeconds * 1000;
                var sandbox;
                beforeEach(function() {
                    sandbox = sinon.sandbox.create();
                    sandbox.useFakeTimers();
                });
                afterEach(function() {
                    sandbox.restore();
                });
                it("we are denied access", function() {
                    return loginToApp(validUser).then(function(res) {
                        sandbox.clock.tick(timeout);
                        return request(app)
                            .get("/rest/user/restricted")
                            .set("Authorization", res.body.token)
                            .expect(401).toPromise();
                    });
                });
                context("but we've refreshed the token", function() {
                    it("we are NOT denied access", function() {
                        var agent = request.agent(app);
                        return agent.post("/rest/user/login")
                            .send(validUser)
                            .expect(200)
                            .then(function() {
                                sandbox.clock.tick(timeout / 2);
                                return agent.get("/rest/user/restricted")
                                    .expect(200).toPromise();
                            }).then(function() {
                                sandbox.clock.tick(timeout / 2);
                                return agent.get("/rest/user/restricted")
                                    .expect(200).toPromise();
                            }).then(function() {
                                sandbox.clock.tick(timeout);
                                return agent.get("/rest/user/restricted")
                                    .expect(401).toPromise();
                            });
                    });
                });
            });
        });
    });
    describe("after signing up", function() {
        context("with valid user info", function() {
            function signupNewUser(username) {
                return request(app)
                    .post("/rest/user/signup")
                    .send({
                        username: username,
                        password: "password",
                        email: username + "@email.com"
                    }).expect(200).toPromise();
            }
            it("we are auth'd and redirected to /home", function() {
                return signupNewUser(_.uniqueId("newuser_")).then(function(res) {
                    res.body.token.should.match(/^Bearer/);
                    res.body.redirect.should.equal("/home");
                });
            });
            it("we are auth'd and redirected to '/home'", function() {
                return signupNewUser(_.uniqueId("newuser_")).then(function(res) {
                    return request(app)
                        .get("/rest/user/restricted")
                        .set("Authorization", res.body.token)
                        .expect(200)
                        .then(function(res) {
                            res.body.should.contain.keys("success", "decoded");
                        });
                });
            });
        });
    });
});
