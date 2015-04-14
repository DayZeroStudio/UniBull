module.exports = function(CFG) {
    "use strict";
    var cfg = {};

    var dev_db_cfg = {
        name: CFG.env.DB_NAME
            || (function(){throw new Error("Missing ENV DB_NAME"); })(),
        username: CFG.env.DB_USERNAME
            || (function(){throw new Error("Missing ENV DB_USERNAME"); })(),
        password: CFG.env.DB_PASSWORD || ""
    };

    if (CFG.isDev) {
        cfg.db = dev_db_cfg;
    } else {
        //TODO: change once set up with heroku
        cfg.db = dev_db_cfg;
    }

    return cfg;
};
