"use strict";
var Promise = require("sequelize").Promise;

module.exports = Promise.promisify(function setupRestEndpoints(models, done) {
    var fs = require("fs");
    var _ = require("lodash");
    var async = require("async");
    var cfg = require("../config");
    var log = cfg.log.logger;

    var express = require("express");
    var appRouter = express.Router();

    // Automagically app.use all rest/*.js
    fs.readdir("rest", function(err, files) {
        if (err) {throw err; }
        log.info("files:", files);
        async.each(files, function(file, eachCallback) {
            var filePath = "../rest/" + file;
            var route = "/rest/" + file.substr(0, file.indexOf("."));
            log.info("Adding REST endpoint: (" + route + ")");
            require(filePath)(models, route).then(function(router) {
                appRouter.use(route, router);
                eachCallback(null);
            });
        }, _.partial(done, _, appRouter));
    });
});
