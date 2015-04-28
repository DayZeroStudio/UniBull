module.exports = function(CFG) {
    "use strict";
    var cfg = {};

    cfg.secret = "Teid]Ib+Cu[ig/elJ$Ig;wuJ?wiAn+vO";
    // If isDev 60 minutes, else 15 minutes
    cfg.timeoutInSeconds = (CFG.isDev ? 60 * 60 : 15 * 60);

    return cfg;
};
