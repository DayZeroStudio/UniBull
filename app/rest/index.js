"use strict";
var Promise = require("sequelize").Promise;

module.exports = function setupRestEndpoints(dbModels) {
    var cfg = require("../../config");
    var log = cfg.log.makeLogger("rest,index,setup");

    var express = require("express");
    var appRouter = express.Router();

    return Promise.resolve([
        {name: "user", route: "user"},
        {name: "class", route: "class"},
        {name: "menu", route: "menu"}
    ]).map(function(obj) {
        var route = "/rest/" + obj.route;
        return require("./"+obj.name+".js")(dbModels, route).then(function(router) {
            log.info("Adding REST endpoint: (" + obj.name + ")");
            appRouter.use(route, router);
        });
    }).then(function() {
        return appRouter;
    });
};
