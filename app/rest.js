"use strict";
var Promise = require("sequelize").Promise;

module.exports = Promise.promisify(function setupRestEndpoints(models, done) {
    var fs = Promise.promisifyAll(require("fs"));

    var cfg = require("../config");
    var log = cfg.log.logger;

    var express = require("express");
    var appRouter = express.Router();

    // Automagically app.use all rest/*.js
    fs.readdirAsync("rest").each(function(file) {
        var requirePath = "../rest/" + file;
        var route = "/rest/" + file.substr(0, file.indexOf("."));
        log.info("Adding REST endpoint: (" + route + ")");
        require(requirePath)(models, route).then(function(router) {
            appRouter.use(route, router);
        });
    }).then(function() {
        done(null, appRouter);
    });
});
