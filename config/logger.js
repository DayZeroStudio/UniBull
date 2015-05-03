"use strict";
module.exports = function(CFG) {
    var cfg = {};
    var _ = require("lodash");

    var bunyan = require("bunyan");
    var parentLogger = bunyan.createLogger({
        name: "UniBull",
        src: CFG.isDev || CFG.isTest,
        level: (CFG.isTest ? (CFG.env.DEBUG ? "info" : "warn")
                : (CFG.isDev ? "debug" : "info")),
        serializers: bunyan.stdSerializers
    });
    cfg.makeLogger = function(tags) {
        var logger = parentLogger.child();
        var debugTags = _.map(tags.split(","), function(elt) {
            return "unibull:" + elt;
        }).join(",");
        logger.debug = require("debug")(debugTags);
        return logger;
    };

    return cfg;
};
