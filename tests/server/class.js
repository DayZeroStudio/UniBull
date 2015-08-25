"use strict";

var chai = require("chai");
var should = chai.should();
chai.use(require("chai-things"));
var request = require("supertest-as-promised");

var app = require("express")();
var agent = request.agent(app);
var utils = require("../utils").server(agent);

//var cfg = require("@config");
//var log = cfg.log.makeLogger("tests,server,class");

describe("testing class endpoints", function() {
    this.timeout(5000);
    before(function() {
        return require("../../server")(app);
    });
    describe("creating a class", function() {
        context("with valid info", function() {
            context("that does NOT already exist", function() {
                var user, newClass;
                beforeEach(function() {
                    user = utils.user.makeNewUser();
                    newClass = utils.class.makeNewClass();
                    return utils.user.signupNewUser(user);
                });
                it("should return the class information", utils.handleErr(function() {
                    return utils.class.createClass(newClass).then(function(res) {
                        res.body.class.should.contain(newClass);
                    });
                }));
                it("should add it to the list of all classes", utils.handleErr(function() {
                    return utils.class.createClass(newClass).then(function() {
                        return agent
                            .get("/api/class")
                            .expect(function(res) {
                                res.body.classes.should.include.something(newClass);
                                res.body.classes.forEach(function(klass) {
                                    klass.should.contain.keys("Threads.uuid");
                                });
                            });
                    });
                }));
                it("should redirect to the new class page", utils.handleErr(function() {
                    return utils.class.createClass(newClass).then(function(res) {
                        res.body.should.contain.key("redirect");
                        res.body.redirect.should.to.match(/\/class\/.+/);
                    });
                }));
            });
            context("that already exists", function() {
                var newClass;
                beforeEach(function() {
                    var user = utils.user.makeNewUser();
                    newClass = utils.class.makeNewClass();
                    return utils.user.signupNewUser(user).then(function() {
                        return utils.class.createClass(newClass);
                    });
                });
                it("should return an error", utils.handleErr(function() {
                    return utils.class.createClass(newClass).catch(function(err) {
                        err.status.should.equal(400);
                        err.response.body.should.contain.keys("error");
                    });
                }));
                it("should redirect to the existing class", utils.handleErr(function() {
                    return utils.class.createClass(newClass).catch(function(err) {
                        err.response.body.should.contain.keys("error", "stack");
                        err.response.body.error.should.match(/Class already exists/);
                    });
                }));
            });
        });
        context("with invalid info", function() {
            it("should return an error", utils.handleErr(function() {
                var invalidClassInfo = {};
                return utils.class.createClass(invalidClassInfo).catch(function(err) {
                    err.status.should.equal(400);
                    err.response.body.should.contain.keys("error");
                    err.response.body.error.should.match(/^notNull Violation/);
                });
            }));
        });
    });
    describe("getting all the classes", function() {
        it("should return a list of all the classes", utils.handleErr(function() {
            return agent
                .get("/api/class/")
                .then(function(res) {
                    res.statusCode.should.equal(200);
                    res.body.classes.should.be.an("array");
                });
        }));
    });
    describe("joining an existing class", function() {
        var newClass, classID,
            user, userID;
        beforeEach(function() {
            newClass = utils.class.makeNewClass();
            user = utils.user.makeNewUser();
            userID = user.username;
            return utils.user.signupNewUser(user).then(function() {
                return utils.class.createClass(newClass);
            }).then(function(res) {
                classID = res.body.class.uuid;
            });
        });
        context("that you are NOT enrolled in", function() {
            it("should redirect to the class page", utils.handleErr(function() {
                return utils.class.joinClass(classID).catch(function(err) {
                    err.status.should.equal(200);
                });
            }));
            it("should add it to the users classes", utils.handleErr(function() {
                return utils.user.loginToApp(user).then(function() {
                    return utils.class.joinClass(classID);
                }).then(function() {
                    return utils.user.getUserInfo(userID);
                }).then(function(res) {
                    res.statusCode.should.equal(200);
                    res.body.Classes.should
                        .have.length.above(0);
                    res.body.Classes.should
                        .include.something({uuid: classID});
                }).catch(function(err) {
                    throw err.response.error;
                });
            }));
        });
        context("that you ARE enrolled in", function() {
            it("should return an error", utils.handleErr(function() {
                return utils.user.loginToApp(user).then(function() {
                    return utils.class.joinClass(classID);
                }).then(function() {
                    return utils.class.joinClass(classID);
                }).catch(function(err) {
                    err.status.should.equal(400);
                    should.exist(err.response.error);
                });
            }));
        });
    });
});
