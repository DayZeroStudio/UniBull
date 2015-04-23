module.exports = function(CFG) {
    "use strict";
    var wd = {};

    wd.name = CFG.env.SEL_BROWSER || "firefox";
    wd.server = {
        port: (wd.name === "phantomjs" ? 4445 : 4444)
    };
    wd.timeout = 1000 * 30; // 30 seconds

    return wd;
};
