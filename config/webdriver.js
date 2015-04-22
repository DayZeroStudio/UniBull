module.exports = function(CFG) {
    "use strict";
    var wd = {};

    wd.name = CFG.env.SEL_BROWSER || "phantomjs";
    wd.server = {
        port: (wd.name === "phantomjs" ? 4445 : 4444)
    };

    return wd;
};
