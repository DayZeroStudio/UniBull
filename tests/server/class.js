/*eslint curly:0, no-unused-vars:0, no-unused-expressions:0*/
"use strict";

var chai = require("chai");
chai.should();
chai.use(require("chai-things"));
var request = require("supertest-as-promised");
var sinon = require("sinon");
var _ = require("lodash");

var app = require("express")();

var cfg = require("../../config");
var log = cfg.log.logger;

var jwt = require("jsonwebtoken");
var validUser = {
    username: "FirstUser",
    password: "mypasswd"
};
var token = "Bearer "+jwt.sign(validUser, cfg.jwt.secret);

describe("testing class endpoints", function() {
    before(function() {
        return require("../../db")().then(function(dbModels) {
            return require("../../app/rest")(dbModels)
                .then(function(router) {
                    app.use(router);
                });
        });
    });
    function makeNewClass() {
        var id = _.uniqueId();
        return {
            info: "info"+id,
            school: "school"+id,
            title: "title"+id
        };
    }
    function createClass(klass) {
        return request(app)
            .post("/rest/class/create")
            .set("Authorization", token)
            .send(klass)
            .expect(200)
            .then(function(res) {
                return res.body;
            });
    }
    describe("creating a class", function() {
        context("with valid info", function() {
            context("that does not exist", function() {
                it("should return the class information", function() {
                    var newClass = makeNewClass();
                    return createClass(newClass).then(function(body) {
                        body.class.should.contain(newClass);
                    });
                });
                it("should add it to the list of all classes", function() {
                    var newClass = makeNewClass();
                    return createClass(newClass).then(function() {
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
                    var newClass = makeNewClass();
                    return createClass(newClass).then(function(body) {
                        body.should.contain.key("redirect");
                        body.redirect.should.to.match(/\/class\/.+/);
                    });
                });
            });
            context("that does exist", function() {
                var newClass;
                beforeEach(function() {
                    newClass = makeNewClass();
                    return createClass(newClass);
                });
                it("should return an error", function() {
                    return createClass(newClass).then(function(body) {
                        body.should.contain.keys("error");
                    });
                });
                it("should redirect to the existing class", function() {
                    return createClass(newClass).then(function(body) {
                        body.should.contain.keys("redirect");
                        body.redirect.should.match(/\/class\/.+/);
                    });
                });
            });
        });
        context("with invalid info", function() {
            it("should return an error", function() {
                var invalidClassInfo = {};
                return createClass(invalidClassInfo).then(function(body) {
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
        var userID = "FirstUser";
        beforeEach(function() {
            var newClass = makeNewClass();
            return createClass(newClass).then(function(body) {
                classID = body.class.title;
            });
        });
        function joinClass(klass) {
            return request(app)
                .post("/rest/user/login")
                .send({
                    username: userID,
                    password: "mypasswd"
                }).then(function(res) {
                    var token = res.body.token;
                    return request(app)
                        .post("/rest/user/"+userID+"/joinClass")
                        .query({classID: classID})
                        .set("Authorization", token)
                        .expect(200)
                        .then(function(res) {
                            return [res.body, token];
                        });
                });
        }
        context("that you are NOT enrolled in", function() {
            it("should redirect to the class page", function() {
                return joinClass(classID).spread(function(body) {
                    body.should.contain.keys("redirect");
                    body.redirect.should.match(/\/class\/.+/);
                });
            });
            it("should add it to the users classes", function() {
                return joinClass(classID).spread(function(body, token) {
                    return request(app)
                        .get("/rest/user/"+userID)
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
                return joinClass(classID).spread(function(body, token) {
                    return joinClass(classID).spread(function(body, token) {
                        body.should.have.keys("error");
                    });
                });
            });
        });
    });
});
