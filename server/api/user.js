"use strict";
module.exports = function(dbModels) {
    var _ = require("lodash");

    var cfg = require("@config");
    var log = cfg.log.makeLogger("user,rest");
    var auth = require("../auth.js");

    var {User, Class} = dbModels;

    return _.mapValues({
        getAllUsers: function(req, res) {
            log.info("GET - Get all users");
            return User.findAll().then(function(dbData) {
                var users = _.invoke(dbData, "get");
                return res.json({users: users});
            });
        },

        login: function(req, res) {
            log.info("POST - Login");
            return User.find({where: {
                username: req.body.username
            }}).then(function(user) {
                if (!user) {
                    return res.status(401)
                        .json({error: "Failed to Authenticate"});
                }
                return user.isValidUser(req.body.password)
                    .then(function() {
                        return auth.onValidUser(user, res);
                    }).catch(function() {
                        return res.status(401)
                            .json({error: "Failed to Authenticate"});
                    });
            });
        },

        restricted: function(req, res) {
            log.info("GET - Restricted");
            return res.json(_.merge({
                success: true
            }, _.pick(req.user, ["username", "email", "role"])));
        },

        signup: function(req, res) {
            log.info("POST - Signup user");
            var username = req.body.username;
            var password = req.body.password;
            var email = req.body.email;
            return User.findOrCreate({where: {
                username: username
            }, defaults: {
                password: password,
                email: email
            }}).bind({}).spread(function(user, created) {
                if (!created) {// ie: username taken
                    throw new Error(cfg.errmsgs.userAlreadyTaken);
                }
                this.user = user;
                return auth.onValidUser(this.user, res);
            });
        },

        getUserInfo: function(req, res) {
            log.info("GET - Get user info");
            return User.find({
                where: {username: req.params.userID},
                include: [{all: true, nested: true}]
            }).then(function(user) {
                var fullUser = _.omit(user.get(), "password_hash");
                return res.json(fullUser);
            });
        },

        joinClass: function(req, res) {
            log.info("POST - Join a class");
            var classID = req.body.classID;
            return User.find({
                where: {username: req.user.username}
            }).bind({}).then(function(user) {
                if (!user) {
                    throw Error(cfg.errmsgs.invalidUserInfo);
                }
                this.user = user;
                return Class.find({where: {uuid: classID}});
            }).then(function(klass) {
                this.class = klass;
                return this.user.hasClass(klass);
            }).then(function(alreadyEnrolled) {
                if (alreadyEnrolled) {
                    throw Error(cfg.errmsgs.userAlreadyEnrolled(this.class.get().title));
                }
                return this.user.addClass(this.class);
            }).then(function() {
                return this.user.getClasses();
            }).then(function(classes) {
                return res.json({
                    redirect: "/class/"+classID,
                    classes: classes
                });
            });
        }
    }, cfg.wrapWithErrorHandler);
};
