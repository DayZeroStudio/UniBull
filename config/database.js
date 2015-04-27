module.exports = function(CFG, log) {
    "use strict";
    var _ = require("lodash");

    var cfg = {
        name: CFG.env.DB_NAME
            || (!CFG.isProd ? (function() {throw new Error("Missing ENV DB_NAME"); })()
                    : undefined),
        username: CFG.env.DB_USERNAME
            || (!CFG.isProd ? (function() {throw new Error("Missing ENV DB_USERNAME"); })()
                    : undefined),
        password: CFG.env.DB_PASSWORD || "",
        url: (CFG.isProd ? CFG.env.DATABASE_URL : undefined),
        options: {
            dialect: "postgres",
            logging: (CFG.isTest ? _.noop : log.debug.bind(log))
        }
    };

    return cfg;
};
