module.exports = function(CFG, log) {
    "use strict";
    var _ = require("lodash");

    var db_cfg = {
        name: CFG.env.DB_NAME
            || (!CFG.isProd ? (function() {throw new Error(CFG.errmsgs.missingDbEnvVars); })()
                    : undefined),
        username: CFG.env.DB_USERNAME
            || (!CFG.isProd ? (function() {throw new Error(CFG.errmsgs.missingDbEnvVars); })()
                    : undefined),
        password: CFG.env.DB_PASSWORD || "",
        url: (CFG.isProd ? CFG.env.DATABASE_URL : undefined),
        options: {
            dialect: "postgres",
            logging: (CFG.isTest ? _.noop : log.debug.bind(log))
        }
    };

    return db_cfg;
};
