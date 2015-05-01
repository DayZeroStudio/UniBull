"use strict";

var chai = require("chai");
chai.should();
chai.use(require("chai-things"));
var request = require("supertest-as-promised");

var app = require("express")();
var utils = require("../utils").server(request, app);

require("blanket")();
describe("testing thread endpoints", function() {
    before(function() {
        return require("../../db")().then(function(dbModels) {
            return require("../../app/rest")(dbModels);
        }).then(function(router) {
            app.use(router);
        });
    });
    var classID;
    beforeEach(function() {
        var newClass = utils.class.makeNewClass();
        return utils.class.createClass(newClass).then(function(body) {
            classID = body.class.title;
        });
    });
    describe("creating a thread in a class", function() {
        context("that you are enrolled in", function() {
            context("with required info", function() {
                it("should add the thread to the class", function() {
                    return utils.class.joinClass(classID).spread(function(body, token) {
                        var thread = utils.thread.makeNewThread();
                        return utils.thread.submitThread(classID, token, thread);
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
                    return utils.class.joinClass(classID).spread(function(body, token) {
                        var thread = utils.thread.makeNewThread();
                        return utils.thread.submitThread(classID, token, thread);
                    }).then(function(res) {
                        res.body.should.contain.key("action");
                        res.body.action.should.equal("refresh");
                    });
                });
            });
            context("without required info", function() {
                it("should return an error", function() {
                    return utils.class.joinClass(classID).spread(function(body, token) {
                        return utils.thread.submitThread(classID, token, {});
                    }).then(function(res) {
                        res.body.should.contain.key("error");
                    });
                });
            });
        });
        context("that you are NOT enrolled in", function() {
            it("should return an error", function() {
                var thread = utils.thread.makeNewThread();
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
                .expect(200)
                .expect(function(res) {
                    res.body.should.contain.key("threads");
                    res.body.threads.should
                        .all.contain.keys("title", "content");
                });
        });
    });
});
