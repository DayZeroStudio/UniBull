"use strict";

var cfg = (function() {
    var dev_db_cfg = {
        name: process.env.DB_NAME || (function(){throw new Error(); })(),
        username: process.env.DB_USERNAME || (function(){throw new Error(); })(),
        password: process.env.DB_PASSWORD || ""
    };

    switch (process.env.NODE_ENV || "development") {
        case "development":
            return dev_db_cfg;
        case "production":
            return dev_db_cfg;//TODO: change once set up with heroku
        default:
            throw new Error(
                    "Invalid NODE_ENV \""
                    + process.env.NODE_ENV
                    + "\"");
    }

    return dev_db_cfg;
})();

module.exports = cfg;
