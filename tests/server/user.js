"use strict";

var chai = require("chai");
var should = chai.should();
var request = require("supertest-as-promised");
var sinon = require("sinon");

var express = require("express");
var app = express();
app.use(require("cookie-parser")());
var agent = request.agent(app);
var utils = require("../utils").server(agent).user;

var cfg = require("../../config");

cfg.coverage();
describe("testing user endpoints", function() {
    before(function() {
        return require("../../db")().then(function(dbModels) {
            return require("../../app/rest")(dbModels);
        }).then(function(router) {
            app.use(router);
        });
    });
    context("without authentication", function() {
        it("GET '/' should return a list of all users", function() {
            return request(app)
                .get("/rest/user")
                .expect(function(res) {
                    res.statusCode.should.equal(200);
                    res.body.users.should.have.length.above(0);
                }).toPromise();
        });
        it("POST '/restricted' should be unauthorized", function() {
            return request(app)
                .post("/rest/user/restricted")
                .expect(function(res) {
                    res.statusCode.should.equal(401);
                    res.body.should.contain.keys("error");
                }).toPromise();
        });
    });
    describe("logging in", function() {
        context("with invalid credentials", function() {
            it("(none) should return an error", function() {
                return utils.loginToApp({}).then(function(res) {
                    res.body.should.have.key("error");
                });
            });
            it("(only username) should return an error", function() {
                return utils.loginToApp({
                    username: "FirstUser"
                }).then(function(res) {
                    res.body.should.have.key("error");
                });
            });
            it("(both) should return an error", function() {
                return utils.loginToApp({
                    username: "FirstUser",
                    password: "imNotTheCorrectPassword"
                }).then(function(res) {
                    res.body.should.have.key("error");
                });
            });
        });
        context("with valid credentials", function() {
            it("we are auth'd and redirected to '/home'", function() {
                return request(app)
                    .post("/rest/user/login")
                    .send(utils.validUser)
                    .expect(function(res) {
                        res.statusCode.should.equal(200);
                        should.exist(res.body.token);
                        res.body.token.should.match(/^Bearer/);
                        res.body.redirect.should.equal("/home");
                    }).toPromise();
            });
            it("we can view restricted pages", function() {
                return utils.loginToApp(utils.validUser).then(function(res) {
                    return agent
                        .get("/rest/user/restricted")
                        .set("Authorization", res.body.token)
                        .expect(function(res) {
                            res.statusCode.should.equal(200);
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
                    return utils.loginToApp(utils.validUser).then(function() {
                        sandbox.clock.tick(timeout);
                        return agent
                            .get("/rest/user/restricted")
                            .toPromise();
                    });
                });
                context("but we've refreshed the token", function() {
                    it("we are NOT denied access", function() {
                        return agent.post("/rest/user/login")
                            .send(utils.validUser)
                            .then(function(res) {
                                res.statusCode.should.equal(200);
                                sandbox.clock.tick(timeout / 2);
                                return agent.get("/rest/user/restricted")
                                    .then(function(res) {
                                        res.statusCode.should.equal(200);
                                    });
                            }).then(function() {
                                sandbox.clock.tick(timeout / 2);
                                return agent.get("/rest/user/restricted")
                                    .then(function(res) {
                                        res.statusCode.should.equal(200);
                                    });
                            }).then(function() {
                                sandbox.clock.tick(timeout);
                                return agent.get("/rest/user/restricted")
                                    .then(function(res) {
                                        res.statusCode.should.equal(401);
                                    });
                            });
                    });
                });
            });
        });
    });
    describe("after signing up", function() {
        context("with valid user info", function() {
            it("we are auth'd and redirected to /home", function() {
                var newUser = utils.makeNewUser();
                return utils.signupNewUser(newUser).then(function(res) {
                    res.body.token.should.match(/^Bearer/);
                    res.body.redirect.should.equal("/home");
                });
            });
            it("we are auth'd and redirected to '/home'", function() {
                var newUser = utils.makeNewUser();
                return utils.signupNewUser(newUser).then(function() {
                    return agent
                        .get("/rest/user/restricted")
                        .then(function(res) {
                            res.statusCode.should.equal(200);
                            res.body.should.contain.keys("success", "decoded");
                        });
                });
            });
            it("we can then login again successfully", function() {
                var newUser = utils.makeNewUser();
                return utils.signupNewUser(newUser).then(function() {
                    return utils.loginToApp(newUser);
                }).then(function(res) {
                    res.body.should.contain.keys("user", "token", "redirect");
                });
            });
        });
        context("when the username is already take", function() {
            it("should return an error", function() {
                var duplicateUser = utils.makeNewUser();
                return utils.signupNewUser(duplicateUser).then(function() {
                    return utils.signupNewUser(duplicateUser).then(function(res) {
                        res.body.should.contain.key("error");
                    });
                });
            });
        });
    });
});
