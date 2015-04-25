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
describe("'"+route+"/thread'", function() {
    before(function(done) {
        require("../../models")(function(models) {
            require("../../"+route)(models, route, function(router) {
                app.use(route, router);
                require("../../rest/user.js")(models, "/rest/user", function(router) {
                    app.use("/rest/user", router);
                    done();
                });
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
    describe("creating a thread in a class", function() {
        context("that you are enrolled in", function() {
            context("with required info", function() {
                it("should add the thread to the class", function(done) {
                    joinClass(classID, function(err, body, token) {
                        if (err) return done(err);
                        request(app)
                            .post(route+"/"+classID+"/submit")
                            .set("Authorization", token)
                            .send({
                                title: "title",
                                content: "content"
                            }).expect(200)
                            .expect(function(res) {
                                res.body.threads.should.be.an("array");
                                res.body.threads.should
                                    .have.length(1);
                                res.body.threads
                                    .should.all.include
                                    .keys("title", "content");
                            }).end(done);
                    });
                });
            });
        });
    });
});
