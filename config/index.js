module.exports = (function() {
    "use strict";
    var _ = require("lodash");
    var cfg = {};

    cfg.env = process.env;
    cfg.PORT = cfg.env.PORT || 8080;

    cfg.isTest = cfg.env.NODE_ENV === "test";
    cfg.isDev = (cfg.env.NODE_ENV || "development") === "development";
    cfg.isProd = !(cfg.isTest || cfg.isDev);
    cfg.errmsgs = require("./errormessages.js");

    var frozenCFG = Object.freeze(_.cloneDeep(cfg));
    cfg.log = require("./logger.js")(frozenCFG);
    cfg.jwt = require("./jsonwebtoken.js")(frozenCFG);
    cfg.db = require("./database.js")(frozenCFG, cfg.log.logger);

    cfg.webdriver = require("./webdriver.js")(frozenCFG);
    cfg.screenshot = {};
    cfg.screenshot.at = function(name) {
        try {
            throw new Error();
        } catch(e) {
            var prev = e.stack.split("\n")[2];
            var prefix = prev.substring(prev.lastIndexOf("/")+1)
                .replace(")", "").match(/(.*):[0-9]+$/)[1];
        }
        var screenshotsDir = "./tmp/screenshots/";
        return screenshotsDir
            + cfg.webdriver.name + "_"
            + prefix + "_"
            + name + "_"
            + _.now()
            + ".png";
    };

    return cfg;
})();
