"use strict";

var cfg = (function() {
    var dev_config = {
        db_name: process.env.DB_NAME || (function(){throw new Error(); })(),
        username: process.env.DB_USERNAME || (function(){throw new Error(); })(),
        password: process.env.DB_PASSWORD || ""
    };
    switch (process.env.NODE_ENV || "development") {
        case "development":
            return dev_config;
        case "production":
            return dev_config;//TODO: change once set up with heroku
        default:
            return {/*error*/};
    }
})();

module.exports = cfg;
