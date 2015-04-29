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
            requestProperty: "jwt",
            getToken: auth.getTokenFromRequest
        }).unless({
            path: publicEndpoints
        }));

        router.use(function(req, res, next) {
            if (req.jwt) {
                var refreshedToken = jwt.sign(req.jwt, cfg.jwt.secret, cfg.jwt.options);
                res.cookie("token", "Bearer " + refreshedToken);
            }

            return next();
        });

        router.use(function(err, req, res, next) {
            if (err.name === "TokenExpiredError") {
                return res.status(401).json({
                    error: cfg.errmsgs.tokenExpired
                });
            } else if (err.name === "UnauthorizedError") {
                return res.status(401).json({
                    error: cfg.errmsgs.unauthorized
                });
            }
            return next();
        });
    };

    auth.decodeRequest = function(req) {
        var jwt = require("jsonwebtoken");
        var token = auth.getTokenFromRequest(req);
        return jwt.decode(token);
    };

    return auth;
})();
