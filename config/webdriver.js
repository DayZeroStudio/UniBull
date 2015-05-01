"use strict";
module.exports = function(CFG) {
    var wd = {};

    wd.name = CFG.env.SEL_BROWSER || "firefox";
    wd.server = {
        port: (wd.name === "phantomjs" ? 4445 : 4444)
    };
    wd.timeout = 1000 * 30; // 30 seconds

    return wd;
};
