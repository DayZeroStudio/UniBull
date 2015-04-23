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
        require("../../"+route)(route, function(router) {
            app.use(route, router);
            done();
        });
    });
    context("getting all the classes", function() {
        it("should return a list of all the classes", function(done) {
            request(app)
                .get(route + "/")
                .expect(200)
                .expect(function(res) {
                    res.body.classes.should.be.an("array");
                }).end(done);
        });
    });
    context("making a class with valid info", function() {
        var makeNewClass = function() {
            var id = _.uniqueId();
            return {
                info: "info"+id,
                school: "school"+id,
                title: "title"+id
            };
        };
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
                    })
                .end(done);
            });
        });
    });
});
