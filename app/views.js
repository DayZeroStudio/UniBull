"use strict";
module.exports = function setupHtmlPages(done) {
    var path = require("path");
    var _ = require("lodash");
    var cfg = require("../config");
    var log = cfg.log.logger;
    var cwd = process.cwd();
    var express = require("express");
    var router = express.Router();

    var publicEndpoints = ["/login", "/signup"];
    require("../app/auth.js").setupAuth(router, publicEndpoints);

    // Automagically render all views/*.html
    var fs = require("fs");
    fs.readdirSync("views").forEach(function(view) {
        var type = view.substr(view.indexOf(".")+1, view.length);
        if (type !== "html") {
            log.debug("ignoring '/views/"+view+"'");
            return;
        }// Only html $file from here on out
        var file = view.substr(0, view.indexOf("."));
        var route = "/" + file;

        // Try to make a bundle from 'views/${file}.js'
        // to 'public/js/${file}-bundle.js'
        var jsFile = path.join(cwd, "views", file+".js");
        fs.open(jsFile, "r", function(err, fd) {
            if (err) {
                return log.debug("err:", err.message);
            }
            var browserify = require("browserify");
            var readStream = fs.createReadStream(null, {fd: fd});
            var bundle = browserify({
                basedir: path.join(cwd, "views")
            });
            bundle.require(readStream, {
                expose: file
            });
            bundle.bundle(function(err, src) {
                if (err) {
                    return log.debug("{file: '%s', err: '%s'}", file, err.message);
                }
                var bundleFile = path.join(cwd, "public", "js", file+"-bundle.js");
                fs.writeFile(bundleFile, src);
            });
        });

        // Try to add 'models/${file}.js' to the html's local variables
        log.info("Adding route: '" + route + "'");
        router.get(route, function(req, res) {
            try {
                var model = require(path.join(cwd, "models", file + ".js"));
                model.locals(req.query, function(locals) {
                    _.merge(res.locals, locals);
                    res.render(file);
                });
            } catch(err) {
                res.render(file);
            }
        });
    });

    return done(null, router);
};
