"use strict";

var chai = require("chai");
chai.should();
chai.use(require("chai-things"));
var request = require("supertest-as-promised");

var app = require("express")();
var agent = request.agent(app);
var utils = require("../utils").server(agent);

var cfg = require("../../config");
cfg.coverage();
describe("testing thread endpoints", function() {
    before(function() {
        return require("../../db")().then(function(dbModels) {
            return require("../../app/rest")(dbModels);
        }).then(function(router) {
            app.use(router);
        });
    });
    var classID, userID, thread;
    beforeEach(function() {
        thread = utils.thread.makeNewThread();
        var newClass = utils.class.makeNewClass();
        classID = newClass.title;
        var user = utils.user.makeNewUser();
        userID = user.username;
        return utils.user.signupNewUser(user).then(function() {
            return utils.class.createClass(newClass);
        });
    });
    describe("creating a thread in a class", function() {
        context("that you are enrolled in", function() {
            context("with required info", function() {
                it("should add the thread to the class", function() {
                    return utils.class.joinClass(userID, classID).then(function() {
                        return utils.thread.submitThread(classID, thread);
                    }).then(function(res) {
                        res.body.should.contain.key("threads");
                        res.body.threads.should.be.an("array");
                        res.body.threads.should
                            .have.length(1);
                        res.body.threads
                            .should.all.include
                            .keys("title", "content");
                    });
                });
                it("should return {action: 'refresh'}", function() {
                    return utils.class.joinClass(userID, classID).then(function() {
                        return utils.thread.submitThread(classID, thread);
                    }).then(function(res) {
                        res.body.should.contain.key("action");
                        res.body.action.should.equal("refresh");
                    });
                });
            });
            context("without required info", function() {
                it("should return an error", function() {
                    return utils.class.joinClass(userID, classID).then(function() {
                        return utils.thread.submitThread(classID, {});
                    }).then(function(res) {
                        res.body.should.contain.key("error");
                    });
                });
            });
        });
        context("that you are NOT enrolled in", function() {
            it("should return an error", function() {
                return utils.thread.submitThread(classID, utils.class.token, thread)
                .then(function(res) {
                    res.body.should.contain.key("error");
                });
            });
        });
    });
    describe("viewing all threads in a class", function() {
        it("should return a list of all the threads in the class", function() {
            return request(app)
                .get("/rest/class/"+classID+"/all")
                .expect(function(res) {
                    res.statusCode.should.equal(200);
                    res.body.should.contain.key("threads");
                    res.body.threads.should
                        .all.contain.keys("title", "content");
                });
        });
    });
});
