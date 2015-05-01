"use strict";

var chai = require("chai");
chai.should();
chai.use(require("chai-things"));
var request = require("supertest-as-promised");

var app = require("express")();
var utils = require("../utils").server(request, app);

require("blanket")();
describe("testing class endpoints", function() {
    before(function() {
        return require("../../db")().then(function(dbModels) {
            return require("../../app/rest")(dbModels);
        }).then(function(router) {
            app.use(router);
        });
    });
    describe("creating a class", function() {
        context("with valid info", function() {
            context("that does not exist", function() {
                it("should return the class information", function() {
                    var newClass = utils.class.makeNewClass();
                    return utils.class.createClass(newClass).then(function(body) {
                        body.class.should.contain(newClass);
                    });
                });
                it("should add it to the list of all classes", function() {
                    var newClass = utils.class.makeNewClass();
                    return utils.class.createClass(newClass).then(function() {
                        return request(app)
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
                    var newClass = utils.class.makeNewClass();
                    return utils.class.createClass(newClass).then(function(body) {
                        body.should.contain.key("redirect");
                        body.redirect.should.to.match(/\/class\/.+/);
                    });
                });
            });
            context("that does exist", function() {
                var newClass;
                beforeEach(function() {
                    newClass = utils.class.makeNewClass();
                    return utils.class.createClass(newClass);
                });
                it("should return an error", function() {
                    return utils.class.createClass(newClass).then(function(body) {
                        body.should.contain.keys("error");
                    });
                });
                it("should redirect to the existing class", function() {
                    return utils.class.createClass(newClass).then(function(body) {
                        body.should.contain.keys("redirect");
                        body.redirect.should.match(/\/class\/.+/);
                    });
                });
            });
        });
        context("with invalid info", function() {
            it("should return an error", function() {
                var invalidClassInfo = {};
                return utils.class.createClass(invalidClassInfo).then(function(body) {
                    body.should.contain.keys("error");
                    body.error.should.match(/^notNull Violation/);
                });
            });
        });
    });
    describe("getting all the classes", function() {
        it("should return a list of all the classes", function() {
            return request(app)
                .get("/rest/class/")
                .expect(200)
                .expect(function(res) {
                    res.body.classes.should.be.an("array");
                });
        });
    });
    describe("joining an existing class", function() {
        var classID;
        beforeEach(function() {
            var newClass = utils.class.makeNewClass();
            return utils.class.createClass(newClass).then(function(body) {
                classID = body.class.title;
            });
        });
        context("that you are NOT enrolled in", function() {
            it("should redirect to the class page", function() {
                return utils.class.joinClass(classID).spread(function(body) {
                    body.should.contain.keys("redirect");
                    body.redirect.should.match(/\/class\/.+/);
                });
            });
            it("should add it to the users classes", function() {
                return utils.class.joinClass(classID).spread(function(body, token) {
                    return request(app)
                        .get("/rest/user/"+utils.class.validUser.username)
                        .set("Authorization", token)
                        .expect(200)
                        .expect(function(res) {
                            res.body.should.have.key("user");
                            res.body.user.classes
                                .should.have.length.above(0);
                        });
                });
            });
        });
        context("that you ARE enrolled in", function() {
            it("should return an error", function() {
                return utils.class.joinClass(classID).spread(function() {
                    return utils.class.joinClass(classID).spread(function(body) {
                        body.should.have.keys("error");
                    });
                });
            });
        });
    });
});
