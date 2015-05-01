"use strict";
module.exports = function(CFG) {
    var cfg = {};

    cfg.secret = "Teid]Ib+Cu[ig/elJ$Ig;wuJ?wiAn+vO";
    cfg.timeoutInSeconds = (CFG.isDev ? 60 * 60 : 15 * 60);
    cfg.options = {
        // If isDev 60 minutes, else 15 minutes
        expiresInSeconds: cfg.timeoutInSeconds,
        issuer: "UniBull"
    };

    return cfg;
};
