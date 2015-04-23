module.exports = function(CFG, log) {
    "use strict";
    var _ = require("lodash");

    var cfg = {
        name: CFG.env.DB_NAME
            || (function() {throw new Error("Missing ENV DB_NAME"); })(),
        username: CFG.env.DB_USERNAME
            || (function() {throw new Error("Missing ENV DB_USERNAME"); })(),
        password: CFG.env.DB_PASSWORD || "",
        options: {
            dialect: "postgres",
            logging: (CFG.isTest ? _.noop : log.debug.bind(log))
        }
    };

    return cfg;
};
