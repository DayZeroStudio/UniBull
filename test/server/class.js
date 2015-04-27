/*eslint curly:0, no-unused-vars:0, no-unused-expressions:0*/
"use strict";

var chai = require("chai");
chai.should();
chai.use(require("chai-things"));
var request = require("supertest");
var sinon = require("sinon");
var async = require("async");
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

var route = "/rest/class";
describe("'"+route+"'", function() {
    before(function(done) {
        require("../../db")().bind({}).then(function(dbModels) {
            this.dbModels = dbModels;
            return require("../../"+route)(dbModels, route);
        }).then(function(router) {
            app.use(route, router);
            return require("../../rest/user.js")(this.dbModels, "/rest/user");
        }).then(function(router) {
            app.use("/rest/user", router);
            done();
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
    function createClass(klass, callback) {
        request(app)
            .post(route + "/create")
            .set("Authorization", token)
            .send(klass)
            .expect(200)
            .end(function(err, res) {
                if (err) return callback(err);
                callback(null, res.body);
            });
    }
    describe("creating a class", function() {
        context("with valid info", function() {
            context("that does not exist", function() {
                it("should return the class information", function(done) {
                    var newClass = makeNewClass();
                    createClass(newClass, function(err, body) {
                        if (err) return done(err);
                        body.class.should.contain(newClass);
                        return done();
                    });
                });
                it("should add it to the list of all classes", function(done) {
                    var newClass = makeNewClass();
                    createClass(newClass, function(err) {
                        if (err) return done(err);
                        request(app)
                            .get(route)
                            .expect(function(res) {
                                log.warn("classes", res.body.classes);
                                log.warn("newClass", newClass);
                                res.body.classes.should.include.something(newClass);
                                res.body.classes.forEach(function(klass) {
                                    klass.should.contain.keys("Threads");
                                });
                            })
                        .end(done);
                    });
                });
                it("should redirect to the new class page", function(done) {
                    var newClass = makeNewClass();
                    createClass(newClass, function(err, body) {
                        if (err) return done(err);
                        body.should.contain.key("redirect");
                        body.redirect.should.to.match(/\/class\/.+/);
                        return done();
                    });
                });
            });
            context("that does exist", function() {
                var newClass;
                beforeEach(function() {
                    newClass = makeNewClass();
                    createClass(newClass, _.noop);
                });
                it("should return an error", function(done) {
                    createClass(newClass, function(err, body) {
                        if (err) return done(err);
                        body.should.contain.keys("error");
                        return done();
                    });
                });
                it("should redirect to the existing class", function(done) {
                    createClass(newClass, function(err, body) {
                        if (err) return done(err);
                        body.should.contain.keys("redirect");
                        body.redirect.should.match(/\/class\/.+/);
                        return done();
                    });
                });
            });
        });
        context("with invalid info", function() {
            it("should return an error", function(done) {
                var invalidClassInfo = {};
                createClass(invalidClassInfo, function(err, body) {
                    if (err) return done(err);
                    body.should.contain.keys("error");
                    body.error.should.match(/^notNull Violation/);
                    return done();
                });
            });
        });
    });
    describe("getting all the classes", function() {
        it("should return a list of all the classes", function(done) {
            request(app)
                .get(route + "/")
                .expect(200)
                .expect(function(res) {
                    res.body.classes.should.be.an("array");
                }).end(done);
        });
    });
    describe("joining an existing class", function() {
        var classID;
        var userID = "FirstUser";
        beforeEach(function(done) {
            var newClass = makeNewClass();
            createClass(newClass, function(err, body) {
                if (err) return done(err);
                classID = body.class.title;
                return done();
            });
        });
        function joinClass(klass, done) {
            request(app)
                .post("/rest/user/login")
                .send({
                    username: userID,
                    password: "mypasswd"
                })
            .end(function(err, res) {
                if (err) return done(err);
                var token = res.body.token;
                request(app)
                    .post("/rest/user/"+userID+"/joinClass")
                    .query({classID: classID})
                    .set("Authorization", token)
                    .expect(200)
                    .end(function(err, res) {
                        if (err) return done(err);
                        return done(null, res.body, token);
                    });
            });
        }
        context("that you are NOT enrolled in", function() {
            it("should redirect to the class page", function(done) {
                joinClass(classID, function(err, body) {
                    if (err) return done(err);
                    body.should.contain.keys("redirect");
                    body.redirect.should.match(/\/class\/.+/);
                    return done();
                });
            });
            it("should add it to the users classes", function(done) {
                joinClass(classID, function(err, body, token) {
                    if (err) return done(err);
                    request(app)
                        .get("/rest/user/"+userID)
                        .set("Authorization", token)
                        .expect(200)
                        .expect(function(res) {
                            res.body.should.have.key("user");
                            res.body.user.classes
                                .should.have.length.above(0);
                        }).end(done);
                });
            });
        });
        context("that you ARE enrolled in", function() {
            it("should return an error", function(done) {
                joinClass(classID, function(err, body, token) {
                    if (err) return done(err);
                    joinClass(classID, function(err, body, token) {
                        if (err) return done(err);
                        body.should.have.keys("error");
                        return done();
                    });
                });
            });
        });
    });
});
