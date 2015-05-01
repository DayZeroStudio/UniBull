"use strict";
module.exports = function(CFG, log) {
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
            logging: log.debug.bind(log)
        }
    };

    return db_cfg;
};
