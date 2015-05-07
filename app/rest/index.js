"use strict";
module.exports = function setupRestEndpoints(dbModels) {
    var Promise = require("bluebird");
    var cfg = require("../../config");
    var log = cfg.log.makeLogger("rest,index,setup");

    var express = require("express");
    var appRouter = express.Router();

    return Promise.resolve([
        "user", "class", "menu"
    ]).map(function(name) {
        var route = "/rest/" + name;
        return require("./"+ name +".js")(dbModels, route).then(function(router) {
            log.info("Adding REST endpoint: (" + name + ")");
            appRouter.use(route, router);
        });
    }).then(function() {
        return appRouter;
    });
};
