"use strict";
module.exports = (function() {
    var auth = {};

    auth.getTokenFromRequest = function(req) {
        var auth = req.headers.authorization;
        var cookieToken = req.cookies.token;
        if (auth&& auth.split(" ")[0] === "Bearer") {
            return auth.split(" ")[1];
        } else if (cookieToken
                && cookieToken.split(" ")[0] === "Bearer") {
            return cookieToken.split(" ")[1];
        }
        return null;
    };

    auth.setupAuth = function(router, publicEndpoints) {
        router.use(require("cookie-parser")());

        var expressJwt = require("express-jwt");
        var jwt = require("jsonwebtoken");
        var cfg = require("../config");

        router.use(expressJwt({
            secret: cfg.jwt.secret,
            getToken: auth.getTokenFromRequest,
            isRevoked: function isRevokedCallback(req, payload, done) {
                var token = auth.getTokenFromRequest(req);
                jwt.verify(token, cfg.jwt.secret, function(err, decoded) {
                    if (err) {return done(err); }
                    return done(null, !decoded);
                });
            }}).unless({
            path: publicEndpoints
        }));

        router.use(function catchTokenExpirationErrors(err, req, res, next) {
            if (err.name === "TokenExpiredError") {
                return res.status(401).json({error: err.name});
            } else if (err.name === "UnauthorizedError") {
                return res.status(401).json({errar: err.name});
            }
            next();
        });
    };

    auth.decodeRequest = function(req) {
        var jwt = require("jsonwebtoken");
        var token = auth.getTokenFromRequest(req);
        return jwt.decode(token);
    };

    return auth;
})();
