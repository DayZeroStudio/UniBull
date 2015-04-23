module.exports = function(CFG) {
    "use strict";
    var cfg = {
        name: CFG.env.DB_NAME
            || (function() {throw new Error("Missing ENV DB_NAME"); })(),
        username: CFG.env.DB_USERNAME
            || (function() {throw new Error("Missing ENV DB_USERNAME"); })(),
        password: CFG.env.DB_PASSWORD || ""
    };

    return cfg;
};
