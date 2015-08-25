"use strict";
var chai = require("chai");
/*var should = */chai.should();
chai.use(require("chai-things"));
chai.use(require("chai-subset"));
var request = require("supertest-as-promised");

var express = require("express");
var app = express();
var agent = request.agent(app);
var utils = require("../utils").server(agent);
var cfg = require("../../config");
// var log = cfg.log.makeLogger("tests,server,reply");

describe.skip("testing reply endpoints", function() {
    before(function() {
        return require("../../server")(app);
    });
    var klass, classID,
    thread, threadID,
    user, userID;
    beforeEach(function() {
        klass = utils.class.makeNewClass();
        thread = utils.thread.makeNewThread();
        user = utils.user.makeNewUser();
        userID = user.username;
        return utils.user.signupNewUser(user).then(function() {
            return utils.class.createClass(klass);
        }).then(function(res) {
            classID = res.body.class.uuid;
        }).then(function() {
            return utils.class.joinClass(userID, classID);
        }).then(function() {
            return utils.thread.submitThread(classID, thread);
        }).then(function(res) {
            threadID = res.body.thread.uuid;
        });
    });
    describe("replying to a thread", function() {
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
                                res.body.should.contain.key("Replies");
                                res.body.Replies.should
                                    .have.length(1);
                                res.body.Replies.should.include
                                    .something.containSubset([{content: reply.content}]);
                            });
                    });
                });
                it("should return the newly created reply", function() {
                    var reply = utils.reply.makeNewReply();
                    return utils.reply.replyToThread(classID, threadID, reply).then(function(res) {
                        res.body.should.contain.key("reply");
                        res.body.reply.should.contain
                            .keys("uuid", "content");
                    });
                });
            });
        });
    });
    describe("replying to a reply", function() {
        context("given you are enrolled", function() {
            context("with required info", function() {
                it("should add the reply to the reply's replies", function() {
                    var reply = utils.reply.makeNewReply();
                    var nestedReply = utils.reply.makeNewReply();
                    return utils.reply.replyToThread(classID, threadID, reply).then(function(res) {
                        var replyID = res.body.reply.uuid;
                        return utils.reply.replyToReply(classID, threadID, replyID, nestedReply);
                    }).then(function(res) {
                        res.statusCode.should.equal(200);
                        res.body.reply.should.containSubset(nestedReply);
                        res.body.topReply.should.contain(reply);
                        res.body.topReply.Replies.should.include.something
                            .containSubset([nestedReply]);
                    });
                });
                it("should add it to the user's replies", function() {
                    var reply = utils.reply.makeNewReply();
                    var nestedReply = utils.reply.makeNewReply();
                    return utils.reply.replyToThread(classID, threadID, reply).then(function(res) {
                        var replyID = res.body.reply.uuid;
                        return utils.reply.replyToReply(classID, threadID, replyID, nestedReply);
                    }).then(function() {
                        return utils.user.getUserInfo(userID);
                    }).then(function(res) {
                        res.body.should.contain.key("Replies");
                        res.body.Replies.should
                            .have.length(2);
                        res.body.Replies.should.include
                            .something.containSubset([{content: nestedReply.content}]);
                    });
                });
            });
        });
    });
    describe("replying to a nested reply", function() {
        context("given you are enrolled", function() {
            context("with required info", function() {
                it("should add the reply to the reply's replies", function() {
                    var reply = utils.reply.makeNewReply();
                    var nestedReply = utils.reply.makeNewReply();
                    var nestedReply2 = utils.reply.makeNewReply();
                    return utils.reply.replyToThread(classID, threadID, reply).then(function(res) {
                        var replyID = res.body.reply.uuid;
                        return utils.reply.replyToReply(classID, threadID, replyID, nestedReply);
                    }).then(function(res) {
                        var replyID = res.body.reply.uuid;
                        return utils.reply.replyToReply(classID, threadID, replyID, nestedReply2);
                    }).then(function() {
                        return utils.user.getUserInfo(userID);
                    }).then(function(res) {
                        res.body.should.contain.key("Replies");
                        res.body.Replies.should
                            .have.length(3);
                        res.body.Replies.should.include
                            .something.containSubset([{content: nestedReply.content}]);
                    });
                });
                it("should be visible when getting all replies under a thread", function() {
                    var reply = utils.reply.makeNewReply();
                    var nestedReply = utils.reply.makeNewReply();
                    var nestedReply2 = utils.reply.makeNewReply();
                    return utils.reply.replyToThread(classID, threadID, reply).then(function(res) {
                        var replyID = res.body.reply.uuid;
                        return utils.reply.replyToReply(classID, threadID, replyID, nestedReply);
                    }).then(function(res) {
                        var replyID = res.body.reply.uuid;
                        return utils.reply.replyToReply(classID, threadID, replyID, nestedReply2);
                    }).then(function() {
                        return agent.get("/rest/class/"+classID+"/thread/"+threadID+"/all")
                            .toPromise();
                    }).then(function(res) {
                        res.body.should.contain.key("replies");
                        res.body.replies.should.have.length(1);
                        res.body.replies[0].Replies.should.have.length(1);
                        res.body.replies[0].Replies[0].Replies.should.have.length(1);
                    });
                });
            });
        });
    });
    describe("getting all replies under a thread", function() {
        it("should return a list of all the replies", function() {
            var reply = utils.reply.makeNewReply();
            return utils.reply.replyToThread(classID, threadID, reply).then(function() {
                return agent.get("/rest/class/"+classID+"/thread/"+threadID+"/all")
                    .toPromise();
            }).then(function(res) {
                // log.warn("body", require("util").inspect(res.body, {depth: 3}));
                res.body.should.contain.key("replies");
            });
        });
    });
    describe("editing a reply", function() {
        var replyID;
        beforeEach(function() {
            var reply = utils.reply.makeNewReply();
            return utils.reply.replyToThread(classID, threadID, reply).then(function(res) {
                replyID = res.body.reply.uuid;
            });
        });
        context("that you created", function() {
            it("should edit the reply", function() {
                var content = {content: "some bs reply"};
                return utils.reply.editReply(classID, threadID, replyID, content).then(function(res) {
                    res.statusCode.should.equal(200);
                    res.body.reply.content.should.equal(content.content);
                });
            });
        });
        context("that you did not create", function() {
            it("should return an error", function() {
                return utils.user.loginToApp(utils.user.validUser).then(function() {
                    return utils.reply.editReply(classID, threadID, replyID, {content: "cntnt"});
                }).then(function(res) {
                    res.statusCode.should.equal(400);
                    res.body.error.should.equal(cfg.errmsgs.naughtyUser);
                });
            });
        });
    });
    describe("deleting a reply", function() {
        var replyID;
        beforeEach(function() {
            var reply = utils.reply.makeNewReply();
            return utils.reply.replyToThread(classID, threadID, reply).then(function(res) {
                replyID = res.body.reply.uuid;
            });
        });
        context("that you created", function() {
            it("should delete the reply", function() {
                return utils.reply.deleteReply(classID, threadID, replyID).then(function() {
                    return utils.reply.getReplies(classID, threadID).then(function(res) {
                        res.statusCode.should.equal(200);
                        res.body.replies.should.not.contain({uuid: replyID});
                    });
                });
            });
        });
        context("that you did not create", function() {
            it("should return an error", function() {
                return utils.user.loginToApp(utils.user.validUser).then(function() {
                    return utils.reply.deleteReply(classID, threadID, replyID);
                }).then(function(res) {
                    res.statusCode.should.equal(400);
                    res.body.error.should.equal(cfg.errmsgs.naughtyUser);
                });
            });
        });
    });
    describe("flagging a reply", function() {
        var replyID;
        beforeEach(function() {
            var reply = utils.reply.makeNewReply();
            return utils.reply.replyToThread(classID, threadID, reply).then(function(res) {
                replyID = res.body.reply.uuid;
            });
        });
        it("should add to the list of reasons why that reply should be flagged", function() {
            return utils.reply.flagReply(classID, threadID, replyID, {reason: "inappropriate"}).then(function() {
                return utils.reply.getReplies(classID, threadID).then(function(res) {
                    var reply = res.body.replies[0];
                    reply.flagged.should.have.length.above(0);
                });
            });
        });
    });
    // describe("endorsing a reply", function() {
    //
    // });
});
