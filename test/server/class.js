/*eslint curly:0, no-unused-vars:0, no-unused-expressions:0*/
"use strict";

var chai = require("chai");
chai.should();
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
        require("../../models")(function(models) {
            require("../../"+route)(models, route, function(router) {
                app.use(route, router);
                done();
            });
        });
    });
    describe("creating a class", function() {
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
                                _.includes(res.body.classes, newClass)
                                    .should.be.true;
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
                before(function() {
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
    });
});
