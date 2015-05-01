"use strict";
module.exports = function(CFG) {
    var cfg = {};

    var bunyan = require("bunyan");
    var parentLogger = bunyan.createLogger({
        name: "UniBull",
        src: CFG.isDev || CFG.isTest,
        level: (CFG.isTest ? "warn"
                : (CFG.isDev ? "debug" : "info")),
        serializers: bunyan.stdSerializers
    });
    cfg.makeLogger = function(tags) {
        return parentLogger.child({
            tags: tags.replace(" ", "").split(",")
        });
    };

    return cfg;
};
