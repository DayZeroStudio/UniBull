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
    function addBundleRoute(baseFile, middleware, opts) {
        var toBundle = opts || {};

        var bundle = makeBundle();

        var toAdds = toBundle.adds || [];
        toAdds.forEach(function(toAdd) {
            bundle.add(path.join(cwd, toAdd.path || "lib", toAdd.name));
        });
        var toRequires = toBundle.requires || [];
        toRequires.forEach(function(toReq) {
            bundle.require(path.join(cwd, toReq.path || "lib", toReq.name), {
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
        requires: [{name: "login.js", expose: "login"}]
    });
    addBundleRoute("signup", null, {
        requires: [{name: "signup.js", expose: "signup"}]
    });
    addBundleRoute("home", null, {
        adds: [{name: "home.js"}]
    });

    (function(router) {
        router.get("/:classID", function(req, res) {
            log.warn("classID:", req.params.classID);
            var classID = req.params.classID;
            res.locals = {
                classID: classID
            }
            res.render("tmpl/classroom");
        });
        addBundleRoute("classroom", null, {
            addRoute: false,
            adds: [{name: "classroom.js"}]
        })
        addBundleRoute("class", router, {
        		requires: [{name: "class.js", expose: "class"}]
        });
    })(express.Router());
    addJustRoute("cs999");

    return done(null, router);
});
