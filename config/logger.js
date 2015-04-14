module.exports = function(CFG) {
    "use strict";
    var cfg = {};

    var bunyan = require("bunyan");
    cfg.logger = bunyan.createLogger({
        name: "UniBull",
        src: CFG.isDev,
        serializers: {
            req: bunyan.stdSerializers.req,
            res: bunyan.stdSerializers.res
        }
    });

    return cfg;
};
