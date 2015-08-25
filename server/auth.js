"use strict";
module.exports = (function() {
    var auth = {};
    var _ = require("lodash");
    var cfg = require("@config");
    var jwt = require("jsonwebtoken");

    auth.passport = require("passport");

    auth.setupAuth = function(app) {
        app.use(auth.passport.initialize());
        var JwtStrategy = require("passport-jwt").Strategy;
        auth.passport.use(new JwtStrategy({
            secretOrKey: cfg.jwt.secret,
            issuer: cfg.jwt.options.issuer
        }, function(jwt, done) {
            return done(null, jwt);
        }));
    };

    auth.addTokenToAuthHeader = function(req, res, next) {
        if (req.cookies && req.cookies.token) {
            req.headers.authorization = req.cookies.token;
        } next();
    };

    auth.authMiddleware = auth.passport.authenticate("jwt", {session: false});

    auth.refreshToken = function(req, res, next) {
        var jwt = require("jsonwebtoken");
        var cfg = require("@config");
        if (req.user) {
            var refreshedToken = jwt.sign(req.user, cfg.jwt.secret, cfg.jwt.options);
            res.cookie("token", "JWT " + refreshedToken);
        } next();
    };

    auth.isAuthorizedFor = function(userRole, superRole) {
        var roles = {
            "student": 0,
            "ta": 1,
            "professor": 2,
            "moderator": 3,
            "admin": 4,
            "superuser": 5,
            "root": 6
        };
        return roles[userRole] >= roles[superRole];
    };

    auth.onValidUser = function(user, res) {
        var publicUserInfo = _.pick(user, ["uuid", "username", "email", "role"]);
        var token = "JWT " + jwt.sign(publicUserInfo, cfg.jwt.secret, cfg.jwt.options);
        res.cookie("token", token).set({
            "Authorization": token
        }).json({
            user: publicUserInfo,
            token: token
        });
    };

    return auth;
})();
