"use strict";

var chai = require("chai");
chai.should();
chai.use(require("chai-things"));
var request = require("supertest-as-promised");
var _ = require("lodash");

var app = require("express")();

var cfg = require("../../config");

var jwt = require("jsonwebtoken");
var validUser = {
    username: "FirstUser",
    password: "mypasswd"
};
var token = "Bearer "+jwt.sign(validUser, cfg.jwt.secret);

require("blanket")();
describe("testing thread endpoints", function() {
    before(function() {
        return require("../../db")().then(function(dbModels) {
            return require("../../app/rest")(dbModels);
        }).then(function(router) {
            app.use(router);
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
    var classID;
    beforeEach(function() {
        var newClass = makeNewClass();
        return createClass(newClass).then(function(body) {
            classID = body.class.title;
        });
    });
    function joinClass() {
        return request(app)
            .post("/rest/user/login")
            .send(validUser).then(function(res) {
                var token = res.body.token;
                return request(app)
                    .post("/rest/user/"+validUser.username+"/joinClass")
                    .send({classID: classID})
                    .set("Authorization", token)
                    .expect(200)
                    .then(function(res) {
                        return [res.body, token];
                    });
            });
    }
    describe("creating a thread in a class", function() {
        var classInfo = {title: "title", content: "content"};
        context("that you are enrolled in", function() {
            context("with required info", function() {
                it("should add the thread to the class", function() {
                    return joinClass(classID).spread(function(body, token) {
                        return request(app)
                            .post("/rest/class/"+classID+"/submit")
                            .set("Authorization", token)
                            .send(classInfo).expect(200)
                            .expect(function(res) {
                                res.body.threads.should.be.an("array");
                                res.body.threads.should
                                    .have.length(1);
                                res.body.threads
                                    .should.all.include
                                    .keys("title", "content");
                            });
                    });
                });
                it("should return {action: 'refresh'}", function() {
                    return joinClass(classID).spread(function(body, token) {
                        return request(app)
                            .post("/rest/class/"+classID+"/submit")
                            .set("Authorization", token)
                            .send(classInfo).expect(200)
                            .expect(function(res) {
                                res.body.should.contain.key("action");
                                res.body.action.should.equal("refresh");
                            });
                    });
                });
            });
            context("without required info", function() {
                it("should return an error", function() {
                    return joinClass(classID).spread(function(body, token) {
                        return request(app)
                            .post("/rest/class/"+classID+"/submit")
                            .set("Authorization", token)
                            .send({}).expect(200)
                            .expect(function(res) {
                                res.body.should.contain.key("error");
                            });
                    });
                });
            });
        });
        context("that you are NOT enrolled in", function() {
            it("should return an error", function() {
                return request(app)
                    .post("/rest/class/"+classID+"/submit")
                    .set("Authorization", token)
                    .send(classInfo).expect(200)
                    .expect(function(res) {
                        res.body.should.contain.key("error");
                    });
            });
        });
    });
    describe("viewing all threads in a class", function() {
        it("should return a list of all the threads in the class", function() {
            return request(app)
                .get("/rest/class/"+classID+"/all")
                .expect(200)
                .expect(function(res) {
                    res.body.should.contain.key("threads");
                    res.body.threads.should
                        .all.contain.keys("title", "content");
                });
        });
    });
});
