"use strict";
module.exports = function setupAuth(router, publicEndpoints) {
    var expressJwt = require("express-jwt");
    var jwt = require("jsonwebtoken");
    var cfg = require("../config");

    function getTokenFromRequest(req) {
        var auth = req.headers.authorization;
        if (auth&& auth.split(" ")[0] === "Bearer") {
            return auth.split(" ")[1];
        }
        return null;
    }

    router.use(expressJwt({
        secret: cfg.jwt.secret,
        isRevoked: function isRevokedCallback(req, payload, done) {
            var token = getTokenFromRequest(req);
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
        }
        next();
    });
};
