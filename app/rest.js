"use strict";
function setupRestEndpoints(app, done) {
    var fs = require("fs");
    var async = require("async");
    var cfg = require("../config");
    var log = cfg.log.logger;
    // Automagically app.use all rest/*.js
    fs.readdir("rest", function(err, files) {
        if (err) {throw err; }
        log.info("files:", files);
        async.each(files, function(file, eachCallback) {
            var filePath = "../rest/" + file;
            var route = "/rest/" + file.substr(0, file.indexOf("."));
            log.info("Adding REST endpoint: (" + route + ")");
            require(filePath)(route, function(router) {
                app.use(route, router);
                eachCallback(null);
            });
        }, function(err) {
            if (err) {
                log.error(err);
            } else {
                log.info("Finished adding REST endpoints");
                done(null);
            }
        });
    });
}
module.exports = setupRestEndpoints;
