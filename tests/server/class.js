"use strict";

var chai = require("chai");
/*var should =*/chai.should();
chai.use(require("chai-things"));
var request = require("supertest-as-promised");

var app = require("express")();
var agent = request.agent(app);
var utils = require("../utils").server(agent);
var cfg = require("../../config");
//var log = cfg.log.makeLogger("tests,server,class");

cfg.coverage();
describe("testing class endpoints", function() {
    this.timeout(5000);
    before(function() {
        return require("../../db")().then(function(dbModels) {
            return require("../../app/rest")(dbModels);
        }).then(function(router) {
            app.use(router);
        });
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
                it("should return the class information", function() {
                    return utils.class.createClass(newClass).then(function(res) {
                        res.body.class.should.contain(newClass);
                    });
                });
                it("should add it to the list of all classes", function() {
                    return utils.class.createClass(newClass).then(function() {
                        return agent
                            .get("/rest/class")
                            .expect(function(res) {
                                res.body.classes.should.include.something(newClass);
                                res.body.classes.forEach(function(klass) {
                                    klass.should.contain.keys("Threads");
                                });
                            });
                    });
                });
                it("should redirect to the new class page", function() {
                    return utils.class.createClass(newClass).then(function(res) {
                        res.body.should.contain.key("redirect");
                        res.body.redirect.should.to.match(/\/class\/.+/);
                    });
                });
            });
            context("that already exists", function() {
                var newClass;
                beforeEach(function() {
                    newClass = utils.class.makeNewClass();
                    return utils.class.createClass(newClass);
                });
                it("should return an error", function() {
                    return utils.class.createClass(newClass).then(function(res) {
                        res.statusCode.should.equal(400);
                        res.body.should.contain.keys("error");
                    });
                });
                it("should redirect to the existing class", function() {
                    return utils.class.createClass(newClass).then(function(res) {
                        res.body.should.contain.keys("redirect");
                        res.body.redirect.should.match(/\/class\/.+/);
                    });
                });
            });
        });
        context("with invalid info", function() {
            it("should return an error", function() {
                var invalidClassInfo = {};
                return utils.class.createClass(invalidClassInfo).then(function(res) {
                    res.statusCode.should.equal(400);
                    res.body.should.contain.keys("error");
                    res.body.error.should.match(/^notNull Violation/);
                });
            });
        });
    });
    describe("getting all the classes", function() {
        it("should return a list of all the classes", function() {
            return request(app)
                .get("/rest/class/")
                .expect(function(res) {
                    res.statusCode.should.equal(200);
                    res.body.classes.should.be.an("array");
                });
        });
    });
    describe("joining an existing class", function() {
        var newClass, classID,
            user, userID;
        beforeEach(function() {
            newClass = utils.class.makeNewClass();
            user = utils.user.makeNewUser();
            userID = user.username;
            return utils.user.signupNewUser(user).then(function() {
                return utils.class.createClass(newClass).then(function(res) {
                    classID = res.body.class.uuid;
                });
            });
        });
        context("that you are NOT enrolled in", function() {
            it("should redirect to the class page", function() {
                return utils.class.joinClass(userID, classID).then(function(res) {
                    res.body.should.contain.keys("redirect");
                    res.body.redirect.should.match(/\/class\/.+/);
                });
            });
            it("should add it to the users classes", function() {
                return utils.user.loginToApp(user).then(function() {
                    return utils.class.joinClass(userID, classID);
                }).then(function() {
                    return utils.user.getUserInfo(userID)
                        .then(function(res) {
                            res.statusCode.should.equal(200);
                            res.body.Classes.should
                                .have.length.above(0);
                            res.body.Classes.should
                                .include.something({uuid: classID});
                        });
                });
            });
        });
        context("that you ARE enrolled in", function() {
            it("should return an error", function() {
                return utils.user.loginToApp(user).then(function() {
                    return utils.class.joinClass(userID, classID);
                }).then(function() {
                    return utils.class.joinClass(userID, classID).then(function(res) {
                        res.statusCode.should.equal(400);
                        res.body.should.have.key("error");
                    });
                });
            });
        });
    });
});
