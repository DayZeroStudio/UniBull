"use strict";
module.exports = function setupRestEndpoints(done) {
    var fs = require("fs");
    var _ = require("lodash");
    var async = require("async");
    var cfg = require("../config");
    var log = cfg.log.logger;
    var express = require("express");
    var outerRouter = express.Router();

    // Automagically app.use all rest/*.js
    fs.readdir("rest", function(err, files) {
        if (err) {throw err; }
        log.info("files:", files);
        async.each(files, function(file, eachCallback) {
            var filePath = "../rest/" + file;
            var route = "/rest/" + file.substr(0, file.indexOf("."));
            log.info("Adding REST endpoint: (" + route + ")");
            require(filePath)(route, function(router) {
                outerRouter.use(route, router);
                eachCallback(null);
            });
        }, _.partial(done, _, outerRouter));
    });
};
