"use strict";

var chai = require("chai");
/*var should = */chai.should();
chai.use(require("chai-things"));
chai.use(require("chai-subset"));
var request = require("supertest-as-promised");

var express = require("express");
var app = express();
app.use(require("cookie-parser")());
var agent = request.agent(app);
var utils = require("../utils").server(agent);
var cfg = require("../../config");
var log = cfg.log.makeLogger("tests,server,reply");

cfg.coverage();
describe("testing reply endpoints", function() {
    before(function() {
        return require("../../db")().then(function(dbModels) {
            return require("../../app/rest")(dbModels);
        }).then(function(router) {
            app.use(router);
        });
    });
    describe("replying to a thread", function() {
        var klass, classID,
            thread, threadID,
            user, userID;
        beforeEach(function() {
            klass = utils.class.makeNewClass();
            thread = utils.thread.makeNewThread();
            user = utils.user.makeNewUser();
            userID = user.username;
            classID = klass.title;
            threadID = thread.title;
            return utils.user.signupNewUser(user).then(function() {
                return utils.class.createClass(klass);
            }).then(function() {
                return utils.class.joinClass(userID, classID);
            }).then(function() {
                return utils.thread.submitThread(classID, thread);
            });
        });
        context("given that you are enrolled in that thread's class", function() {
            context("with required info", function() {
                it("should add the reply to that thread's replies", function() {
                    var reply = utils.reply.makeNewReply();
                    return utils.reply.replyToThread(classID, threadID, reply).then(function(res) {
                        res.body.should.contain.keys("replies");
                        res.body.replies.should.be.an("array");
                        res.body.replies.should.containSubset([reply]);
                    });
                });
                it("should add the reply to the user's replies", function() {
                    var reply = utils.reply.makeNewReply();
                    return utils.reply.replyToThread(classID, threadID, reply).then(function() {
                        return utils.user.getUserInfo(userID)
                            .then(function(res) {
                                res.body.user.should.contain.key("replies");
                                res.body.user.replies.should
                                    .have.length(1);
                                res.body.user.replies.should
                                    .include.something({content: reply.content});
                            });
                    });
                });
            });
        });
    });
});
