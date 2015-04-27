"use strict";
var Promise = require("sequelize").Promise;

module.exports = Promise.promisify(function setupHtmlPages(models, done) {
    var path = require("path");
    var cwd = process.cwd();

    var fs = require("fs");
    var cfg = require("../config");
    var log = cfg.log.logger;

    var express = require("express");
    var router = express.Router();

    var publicEndpoints = ["/login", "/signup"];
    require("../app/auth.js").setupAuth(router, publicEndpoints);

    var browserify = require("browserify");
    function makeBundle() {
        return browserify({
            basedir: path.join(cwd, "views")
        });
    }

    function addJustRoute(baseFile, middleware) {
        router.get("/"+baseFile, function(req, res) {
            res.render(baseFile);
        });
        router.use("/"+baseFile, middleware || function() {});
    }
    // Refactor middlware into opts
    function addBundleRoute(baseFile, middleware, opts) {
        var toBundle = opts || {};

        var bundle = makeBundle();

        var toAdds = toBundle.adds || [];
        toAdds.forEach(function(toAdd) {
            var dirPath = toAdd.path || path.join("lib", "adds");
            bundle.add(path.join(cwd, dirPath, toAdd.name));
        });
        var toRequires = toBundle.requires || [];
        toRequires.forEach(function(toReq) {
            var dirPath = toReq.path || path.join("lib", "requires");
            bundle.require(path.join(cwd, dirPath, toReq.name), {
                expose: toReq.expose || toReq.name
            });
        });

        bundle.bundle(function(err, src) {
            if (err) {throw err; }
            fs.writeFile(path.join(cwd, "public", "js",
                        baseFile+"-bundle.js"), src);
        });

        var shouldAddRoute = opts.addRoute || true;
        if (shouldAddRoute) {
            addJustRoute(baseFile, middleware);
        }
    }

    addBundleRoute("login", null, {
        adds: [{name: "login.js"}],
        requires: [{name: "login.js", expose: "login"}]
    });
    addBundleRoute("signup", null, {
        adds: [{name: "signup.js"}],
        requires: [{name: "signup.js", expose: "signup"}]
    });
    addBundleRoute("home", null, {
        adds: [{name: "home.js"}]
    });

    // Setup for "/class"
    (function(router) {
        router.get("/:classID", function(req, res) {
            var classID = req.params.classID;
            log.warn("classID:", classID);
            res.locals.classID = classID;
            res.render("tmpl/classroom");
        });
        addBundleRoute("classroom", null, {
            addRoute: false,
            adds: [{name: "classroom.js"}]
        });
        addBundleRoute("class", router, {
            requires: [{name: "class.js", expose: "class"}],
            adds: [{name: "class.js"}]
        });
    })(express.Router());

    return done(null, router);
});
