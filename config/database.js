module.exports = function(/*CFG*/) {
    "use strict";
    var cfg = {};

    var dev_db_cfg = {
        name: process.env.DB_NAME || (function(){throw new Error(); })(),
        username: process.env.DB_USERNAME || (function(){throw new Error(); })(),
        password: process.env.DB_PASSWORD || ""
    };

    switch (process.env.NODE_ENV || "development") {
        case "development":
            cfg.db = dev_db_cfg;
            break;
        case "production":
            //TODO: change once set up with heroku
            cfg.db = dev_db_cfg;
            break;
        default:
            throw new Error(
                    "Invalid NODE_ENV \""
                    + process.env.NODE_ENV
                    + "\"");
    }

    return cfg;
};
