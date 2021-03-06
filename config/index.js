"use strict";
module.exports = (function() {
    var _ = require("lodash");
    var cfg = {};

    /* CLIENT + SERVER STUFF */
    cfg.errmsgs = require("./errormessages.js");

    cfg.dfltTitle = "UniBull";
    cfg.env = process.env;
    cfg.PORT = cfg.env.PORT || 8080;

    cfg.isTest = cfg.env.NODE_ENV === "test";
    cfg.isDev = (cfg.env.NODE_ENV || "development") === "development";
    cfg.isProd = !(cfg.isTest || cfg.isDev);

    cfg.client = _.cloneDeep(cfg);

    /* SERVER STUFF */
    var frozenCFG = Object.freeze(_.cloneDeep(cfg));
    cfg.log = require("./logger.js")(frozenCFG);
    cfg.jwt = require("./jsonwebtoken.js")(frozenCFG);
    cfg.db = require("./database.js")(frozenCFG, cfg.log.makeLogger("db"));

    var handleErr = function(res) {
        return function(err) {
            if (cfg.isDev) {
                var log = cfg.log.makeLogger("error");
                log.error(err);
                return res.status(400).json({
                    error: err.message,
                    stack: err.stack
                });
            } else if (cfg.isTest) {
                return res.status(400).json({
                    error: err.message,
                    stack: err.stack
                });
            } else {
                return res.status(400).json({
                    error: err.message
                });
            }
        };
    };
    cfg.wrapWithErrorHandler = function(fn) {
        return function(req, res) {
            return fn.call(fn, req, res).catch(handleErr(res));
        };
    };

    cfg.webdriver = require("./webdriver.js")(frozenCFG);
    cfg.screenshot = {};
    cfg.screenshot.at = function(name) {
        try {
            throw new Error();
        } catch(e) {
            var prev = e.stack.split("\n")[2];
            var fileAndLineNum =
                // just get the base filename
                prev.substring(prev.lastIndexOf("/")+1)
                // remove extraneous chars
                .replace(")", "")
                // remove col num
                .match(/(.*):[0-9]+$/)[1];
        }
        var screenshotsDir = "./tmp/screenshots/";
        return screenshotsDir
            + cfg.webdriver.name + "_"
            + fileAndLineNum + "__"
            + name + "__"
            + "+T" + _.now()
            + ".png";
    };

    cfg.inspect = function(x, d) {
        require("util").inspect(x, {depth: (d || null)});
    };

    var path = require("path");
    cfg.fixPath = function(pathString) {
        return path.resolve(path.normalize(pathString));
    };

    return cfg;
})();
