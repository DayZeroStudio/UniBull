var cfg = (function() {
    "use strict";
    var cfg = {};

    cfg.env = process.env;
    cfg.isDev = cfg.env.NODE_ENV !== "production";

    var bunyan = require("bunyan");
    cfg.log = bunyan.createLogger({
        name: "UniBull",
        src: cfg.isDev,
        serializers: {
            req: bunyan.stdSerializers.req,
            res: bunyan.stdSerializers.res
        }
    });

    cfg.db = require("./database.js");

    return cfg;
})();

module.exports = cfg;
