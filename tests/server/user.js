"use strict";

var chai = require("chai");
/*var should = */chai.should();
var sinon = require("sinon");

var express = require("express");
var app = express();

var request = require("supertest-as-promised");
var agent = request.agent(app);
var utils = require("../utils").server(agent);

var cfg = require("@config");

describe("testing user endpoints", function() {
    before(function() {
        return require("../../server")(app);
    });
    context("without authentication", function() {
        it("GET '/' should return a list of all users", utils.handleErr(function() {
            return request(app)
                .get("/api/user")
                .expect(function(res) {
                    res.statusCode.should.equal(200);
                    res.body.users.should.have.length.above(0);
                }).toPromise();
        }));
        it("POST '/restricted' should be unauthorized", utils.handleErr(function() {
            return request(app)
                .get("/api/user/restricted")
                .toPromise().catch(function(err) {
                    err.status.should.equal(401);
                });
        }));
    });
    describe("logging in", function() {
        context("with invalid credentials", function() {
            it("(none) should return an error", utils.handleErr(function() {
                return utils.user.loginToApp({}).catch(function(err) {
                    err.response.status.should.equal(401);
                    err.response.body.should.have.key("error");
                });
            }));
            it("(only username) should return an error", utils.handleErr(function() {
                return utils.user.loginToApp({
                    username: "FirstUser"
                }).catch(function(err) {
                    err.response.status.should.equal(401);
                    err.response.body.should.have.key("error");
                });
            }));
            it("(both) should return an error", utils.handleErr(function() {
                return utils.user.loginToApp({
                    username: "FirstUser",
                    password: "imNotTheCorrectPassword"
                }).catch(function(err) {
                    err.response.status.should.equal(401);
                    err.response.body.should.have.key("error");
                });
            }));
        });
        context("with valid credentials", function() {
            it("we are auth'd", utils.handleErr(function() {
                return request(app)
                    .post("/api/user/login")
                    .send(utils.user.validUser)
                    .toPromise().then(function(res) {
                        res.status.should.equal(200);
                        res.res.body.token.should.match(/^JWT/);
                    });
            }));
            it("we can view restricted pages", utils.handleErr(function() {
                return utils.user.loginToApp(utils.user.validUser).then(function() {
                    return agent
                        .get("/api/user/restricted")
                        .expect(function(res) {
                            res.statusCode.should.equal(200);
                            res.body.should
                                .contain.keys("username", "email");
                        }).toPromise();
                });
            }));
            it("we can access our *public* user info", utils.handleErr(function() {
                return utils.user.loginToApp(utils.user.validUser).then(function() {
                    return utils.user.getUserInfo(utils.user.validUser.username);
                }).then(function(res) {
                    res.body.should.contain
                        .keys("username", "email", "Classes", "Threads", "Replies");
                    res.body.should.not.contain
                        .keys("password_hash");
                });
            }));
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
                it("we are denied access", utils.handleErr(function() {
                    return utils.user.loginToApp(utils.user.validUser).then(function() {
                        sandbox.clock.tick(timeout);
                        return agent
                            .get("/api/user/restricted")
                            .toPromise().catch(function(err) {
                                err.status.should.equal(401);
                            });
                    });
                }));
                context("but we've refreshed the token", function() {
                    it("we are NOT denied access", utils.handleErr(function() {
                        return agent.post("/api/user/login")
                            .send(utils.user.validUser)
                            .then(function(res) {
                                res.statusCode.should.equal(200);
                                sandbox.clock.tick(timeout / 2);
                                return agent.get("/api/user/restricted")
                                    .then(function(res) {
                                        res.statusCode.should.equal(200);
                                    });
                            }).then(function() {
                                sandbox.clock.tick(timeout / 2);
                                return agent.get("/api/user/restricted")
                                    .then(function(res) {
                                        res.statusCode.should.equal(200);
                                    });
                            }).then(function() {
                                sandbox.clock.tick(timeout);
                                return agent.get("/api/user/restricted")
                                    .toPromise().catch(function(err) {
                                        err.status.should.equal(401);
                                    });
                            });
                    }));
                });
            });
        });
    });
    describe("after signing up", function() {
        context("with valid user info", function() {
            it("we are auth'd", utils.handleErr(function() {
                var newUser = utils.user.makeNewUser();
                return utils.user.signupNewUser(newUser).then(function(res) {
                    res.body.token.should.match(/^JWT/);
                });
            }));
            it("we are auth'd", utils.handleErr(function() {
                var newUser = utils.user.makeNewUser();
                return utils.user.signupNewUser(newUser).then(function() {
                    return agent.get("/api/user/restricted");
                }).then(function(res) {
                    res.statusCode.should.equal(200);
                    res.body.should.contain.keys("email", "role", "username");
                    res.body.username.should.equal(newUser.username);
                });
            }));
            it("we can then login again successfully", utils.handleErr(function() {
                var newUser = utils.user.makeNewUser();
                return utils.user.signupNewUser(newUser).then(function() {
                    return utils.user.loginToApp(newUser);
                }).then(function(res) {
                    res.body.should.contain.keys("user", "token");
                });
            }));
        });
        context("when the username is already take", function() {
            it("should return an error", utils.handleErr(function() {
                var duplicateUser = utils.user.makeNewUser();
                return utils.user.signupNewUser(duplicateUser).then(function() {
                    return utils.user.signupNewUser(duplicateUser).catch(function(err) {
                        err.status.should.equal(400);
                        err.response.body.should.contain.key("error");
                    });
                });
            }));
        });
    });
});
