"use strict";
module.exports = function(dbModels) {
    var _ = require("lodash");

    var cfg = require("@config");
    var log = cfg.log.makeLogger("rest,class");

    var {Class, Thread, User} = dbModels;

    return _.mapValues({
        getAllThreads: function(req, res) {
            log.info("GET - Get all threads");
            var classID = req.params.classID;
            log.info("params:", req.params);
            return Class.find({
                where: {uuid: classID}
            }).then(function(klass) {
                return Thread.findAll({
                    where: {ClassUuid: klass.get().uuid},
                    include: [{all: true, nested: true}]
                });
            }).then(function(threads) {
                return res.json(threads);
            });
        },

        getThread: function(req, res) {
            log.info("GET - Get a specific thread");
            var classID = req.params.classID;
            var threadID = req.params.threadID;
            return Class.find({
                where: {uuid: classID}
            }).then(function(klass) {
                return klass.getThreads({
                    where: {uuid: threadID}
                });
            }).then(function(threads) {
                return threads[0];
            }).then(function(thread) {
                return res.json(thread);
            });
        },

        submitThread: function(req, res) {
            log.info("POST - Submit a new thread to :classID");
            var title = req.body.title;
            var content = req.body.content;
            var classID = req.params.classID;
            return Class.find({
                where: {uuid: classID}
            }).bind({}).then(function(klass) {
                if (!content || !title) {
                    throw Error(cfg.errmsgs.missingReqInfo);
                }
                this.class = klass;
            }).then(function() {
                // Get the user
                var username = req.user.username;
                // check user is enrolled in :classID
                return User.find({where:
                    {username: username}
                });
            }).then(function(user) {
                // Verify user is found
                if (!user) {
                    throw Error(cfg.errmsgs.invalidUserInfo);
                }
                this.user = user;
                return user.getClasses({where: {uuid: classID}});
            }).then(function(klass) {
                // Verify user is enrolled
                if (klass.length === 0) {
                    throw Error(cfg.errmsgs.userNotEnrolled);
                }
            }).then(function() {
                return Thread.create({
                    title: title,
                    content: content
                });
            }).then(function(thread) {
                this.thread = thread;
                return this.class.addThread(thread);
            }).then(function() {
                return this.user.addThread(this.thread);
            }).then(function() {
                return this.thread.setUser(this.user);
            }).then(function() {
                return this.class.getThreads({}, {raw: true});
            }).then(function(threads) {
                return res.json({
                    threads: threads,
                    thread: this.thread,
                    action: "refresh"
                });
            });
        },

        editThread: function(req, res) {
            log.info("PUT - editing a thread");
            var content = req.body.content;
            var title = req.body.title;
            //var title = req.params.classID;
            var classID = req.params.classID;
            var threadID = req.params.threadID;
            return Class.find({
                where: {uuid: classID}
            }).bind({}).then(function(klass) {
                this.class = klass;
            }).then(function() {
                var username = req.user.username;
                return User.find({
                    where: {username: username}
                });
            }).then(function(user) {
                if (!user) {
                    throw new Error(cfg.errmsgs.invalidUserInfo);
                }
                this.user = user;
            }).then(function() {
                return this.class.getThreads({
                    where: {uuid: threadID}
                });
            }).then(function(threads) {
                var thread = threads[0];
                if (this.user.uuid !== thread.UserUuid) {
                    throw new Error(cfg.errmsgs.naughtyUser);
                }
                thread.content = content;
                thread.title = title;
                return thread.save();
            }).then(function(thread) {
                return res.json({
                    thread: thread
                });
            });
        },

        deleteThread: function(req, res) {
            log.info("DELETE - deleting a thread");
            var classID = req.params.classID;
            var threadID = req.params.threadID;
            return Class.find({
                where: {uuid: classID}
            }).bind({}).then(function(klass) {
                this.class = klass;
            }).then(function() {
                var username = req.user.username;
                return User.find({
                    where: {username: username}
                });
            }).then(function(user) {
                if (!user) {
                    throw Error(cfg.errmsgs.invalidUserInfo);
                }
                this.user = user;
            }).then(function() {
                return this.class.getThreads({
                    where: {uuid: threadID}
                });
            }).then(function(threads) {
                var thread = threads[0];
                if (this.user.uuid !== thread.UserUuid) {
                    throw Error(cfg.errmsgs.naughtyUser);
                }
                return thread.destroy();
            }).then(function() {
                return res.json({
                    success: true
                });
            });
        },

        flagThread: function(req, res) {
            log.info("POST - flagging a thread");
            var classID = req.params.classID;
            var threadID = req.params.threadID;
            var reason = req.body.reason;
            return Class.find({
                where: {uuid: classID}
            }).bind({}).then(function(klass) {
                this.class = klass;
            }).then(function() {
                return this.class.getThreads({
                    where: {uuid: threadID}
                });
            }).then(function(threads) {
                var thread = threads[0];
                if (!thread.flagged) {
                    thread.flagged = [];
                }
                thread.flagged.push(reason);
                return thread.save();
            }).then(function(thread) {
                return res.json({
                    thread: thread
                });
            });
        },

        endorseThread: function(req, res) {
            log.info("POST - endorsing a thread");
            var classID = req.params.classID;
            var threadID = req.params.threadID;
            var reason = req.body.reason;
            return Class.find({
                where: {uuid: classID}
            }).bind({}).then(function(klass) {
                this.class = klass;
            }).then(function() {
                var username = req.user.username;
                //TODO: fix/refactor to auth.asdfasdf
                var instructorRoles = {
                    "ta": 1,
                    "professor": 2
                };
                if (instructorRoles.indexOf(req.user.role) < 0) {
                    throw new Error(cfg.errmsgs.naughtyUser);
                }
                return User.find({
                    where: {username: username}
                });
            }).then(function(user) {
                if (!user) {
                    throw new Error(cfg.errmsgs.invalidUserInfo);
                }
                this.user = user;
            }).then(function() {
                return this.class.getThreads({
                    where: {uuid: threadID}
                });
            }).then(function(threads) {
                var thread = threads[0];
                if (this.user.uuid === thread.UserUuid) {
                    throw new Error(cfg.errmsgs.sillyUser);
                }
                if (!thread.endorsed) {
                    thread.endorsed = [];
                }
                thread.endorsed.push(reason);
                return thread.save();
            }).then(function(thread) {
                return res.json({
                    thread: thread
                });
            });
        }
    }, cfg.wrapWithErrorHandler);
};
