"use strict";
var Promise = require("sequelize").Promise;

module.exports = Promise.promisify(function setupRestEndpoints(models, done) {
    var cfg = require("../../config");
    var log = cfg.log.logger;

    var express = require("express");
    var appRouter = express.Router();

    Promise.resolve(["user", "class"]).each(function(name) {
        var route = "/rest/" + name;
        require("./"+name+".js")(models, route).then(function(router) {
            log.info("Adding REST endpoint: (" + route + ")");
            appRouter.use(route, router);
        });
    }).then(function() {
        done(null, appRouter);
    });
});
