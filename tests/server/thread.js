"use strict";

var chai = require("chai");
chai.should();
chai.use(require("chai-things"));
var request = require("supertest-as-promised");

var app = require("express")();
var agent = request.agent(app);
var utils = require("../utils").server(agent);

var cfg = require("@config");

describe("testing thread endpoints", function() {
    before(function() {
        return require("../../server")(app);
    });
    var classID, userID, thread;
    beforeEach(function() {
        thread = utils.thread.makeNewThread();
        var newClass = utils.class.makeNewClass();
        var user = utils.user.makeNewUser();
        return utils.user.signupNewUser(user).then(function(res) {
            userID = res.body.user.username;
        }).then(function() {
            return utils.class.createClass(newClass);
        }).then(function(res) {
            classID = res.body.class.uuid;
        });
    });
    describe("creating a thread in a class", function() {
        context("that you are enrolled in", function() {
            beforeEach(function() {
                return utils.class.joinClass(classID);
            });
            context("with required info", function() {
                it("should add the thread to the class", utils.handleErr(function() {
                    return utils.thread.submitThread(classID, thread).then(function(res) {
                        res.body.should.contain.key("threads");
                        res.body.threads.should.be.an("array");
                        res.body.threads.should
                            .have.length(1);
                        res.body.threads
                            .should.all.include
                            .keys("title", "content");
                    }).catch(function(err) {throw Error(err.response.error); });
                }));
                it("should return {action: 'refresh'}", utils.handleErr(function() {
                    return utils.thread.submitThread(classID, thread).then(function(res) {
                        res.body.should.contain.key("action");
                        res.body.action.should.equal("refresh");
                    }).catch(function(err) {throw Error(err.response.error); });
                }));
                it("should add it to the user's threads", utils.handleErr(function() {
                    return utils.thread.submitThread(classID, thread).then(function() {
                        return utils.user.getUserInfo(userID);
                    }).then(function(res) {
                        res.body.should.contain.key("Threads");
                        res.body.Threads.should
                            .be.an("array")
                            .include.something({title: thread.title});
                    }).catch(function(err) {throw Error(err.response.error); });
                }));
            });
            context("without required info", function() {
                it("should return an error", utils.handleErr(function() {
                    return utils.thread.submitThread(classID, {}).catch(function(err) {
                        err.status.should.equal(400);
                        err.response.body.should.contain.key("error");
                    });
                }));
            });
        });
        context("that you are NOT enrolled in", function() {
            it("should return an error", utils.handleErr(function() {
                return utils.thread.submitThread(classID, thread).catch(function(err) {
                        err.status.should.equal(400);
                        err.response.should.contain.key("error");
                    });
            }));
        });
    });
    describe("viewing all threads in a class", function() {
        it("should return a list of all the threads in the class", utils.handleErr(function() {
            return utils.class.joinClass(classID).then(function() {
                return utils.thread.submitThread(classID, thread);
            }).then(function() {
                return utils.thread.getAllThreads(classID)
                    .then(function(res) {
                        res.statusCode.should.equal(200);
                        res.body.should.have.length.above(0);
                        res.body.should
                            .include.something({title: thread.title})
                            .all.contain.keys("title", "content", "User.uuid");
                        res.body.should
                            .include.something({User: {username: userID}});
                    });
            });
        }));
    });
    describe("viewing a single thread in a class", function() {
        it("should return a single thread in the class", utils.handleErr(function() {
            return utils.class.joinClass(classID).then(function() {
                return utils.thread.submitThread(classID, thread);
            }).then(function(res) {
                return res.body.threads[0];
            }).then(function(thread) {
                var threadID = thread.uuid;
                return utils.thread.getThread(classID, threadID).then(function(res) {
                    res.statusCode.should.equal(200);
                    res.body.should.contain.key("title");
                });
            });
        }));
    });
    describe("edting a thread in a class", function() {
        var threadID;
        beforeEach(function() {
            return utils.class.joinClass(classID).then(function() {
                return utils.thread.submitThread(classID, thread);
            }).then(function(res) {
                threadID = res.body.threads[0].uuid;
            });
        });
        context("that you created", function() {
            it("should update the title and content of that thread", utils.handleErr(function() {
                return utils.thread.editThread(classID, threadID, "somebullshitstring", "somebullshittitle").then(function(res) {
                    res.statusCode.should.equal(200);
                }).catch(function(err) {throw err.response.error; });
            }));
        });
        context("that you did not create", function() {
            it("should return an error", utils.handleErr(function() {
                return utils.user.loginToApp(utils.user.validUser).then(function() {
                    return utils.thread.editThread(classID, threadID, "cc", "tt");
                }).catch(function(err) {
                    err.status.should.equal(400);
                    err.response.body.error.should.equal(cfg.errmsgs.naughtyUser);
                });
            }));
        });
    });
    describe("deleting a thread from a class", function() {
        var threadID;
        beforeEach(function() {
            return utils.class.joinClass(classID).then(function() {
                return utils.thread.submitThread(classID, thread);
            }).then(function(res) {
                threadID = res.body.threads[0].uuid;
            });
        });
        context("that you created", function() {
            it("should remove that thread from that class", utils.handleErr(function() {
                return utils.thread.deleteThread(classID, threadID).then(function() {
                    return utils.thread.getAllThreads(classID).then(function(res) {
                        res.body.should.not.contain({uuid: threadID});
                    });
                });
            }));
        });
        context("that you did not create", function() {
            it("should return an error", utils.handleErr(function() {
                return utils.user.loginToApp(utils.user.validUser).then(function() {
                    return utils.thread.deleteThread(classID, threadID);
                }).catch(function(err) {
                    err.status.should.equal(400);
                    err.response.body.error.should.equal(cfg.errmsgs.naughtyUser);
                });
            }));
        });
    });
    describe("flagging a thread in a class", function() {
        var threadID;
        beforeEach(function() {
            return utils.class.joinClass(classID).then(function() {
                return utils.thread.submitThread(classID, thread);
            }).then(function(res) {
                threadID = res.body.threads[0].uuid;
            });
        });
        context("that you are enrolled in", function() {
            it("should add to the list of reasons why that post should be flagged", utils.handleErr(function() {
                return utils.thread.flagThread(classID, threadID, {reason: "inappropriate"}).then(function() {
                    return utils.thread.getThread(classID, threadID).then(function(res) {
                        res.body.flagged.should.have.length.above(0);
                    });
                });
            }));
        });
    });
    // describe("endorsing a thread in a class", function() {
    //     var threadID;
    //     beforeEach(function() {
    //         return utils.class.joinClass(classID).then(function() {
    //             return utils.thread.submitThread(classID, thread);
    //         }).then(function(res) {
    //             threadID = res.body.threads[0].uuid;
    //         });
    //     });
    //     context("that you have joined", function() {
    //         context("as an instructor", function() {
    //             it("should endorse the thread", utils.handleErr(function() {
    //                 return utils.user.loginToApp(utils.user.validInstructor).then(function() {
    //                     return utils.class.joinClass(utils.user.validInstructor.username, classID).then(function() {
    //                         utils.thread.endorseThread(classID, threadID, {reason: "well written"}).then(function() {
    //                             return utils.thread.getThread(classID, threadID).then(function(res) {
    //                                 console.log("res body: ", res.body);
    //                                 res.body.thread.endorsed.should.have.length.above(0);
    //                             });
    //                         });
    //                     });
    //                 });
    //             }));
    //         });
    //         context("as a student", function() {
    //             it("should return an error", utils.handleErr(function() {
    //                 return utils.user.loginToApp(utils.user.validUser).then(function() {
    //                     return utils.class.joinClass(utils.user.validUser.username, classID).then(function() {
    //                         return utils.thread.endorseThread(classID, threadID, {reason: "good stuff"}).then(function() {
    //                             return utils.thread.getThread(classID, threadID).then(function(res) {
    //                                 res.statusCode.should.equal(400);
    //                             });
    //                         });
    //                     });
    //                 });
    //             }));
    //         });
    //     });
    // });
});
