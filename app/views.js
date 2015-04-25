"use strict";
var Promise = require("sequelize").Promise;

module.exports = Promise.promisify(function setupHtmlPages(models, done) {
    var path = require("path");
    var cwd = process.cwd();

    var fs = require("fs");
  //var cfg = require("../config");
  //var log = cfg.log.logger;

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

    function addJustRoute(baseFile) {
        router.get("/"+baseFile, function(req, res) {
            res.render(baseFile);
        });
    }
    function addBundleRoute(baseFile, opts) {
        var toBundle = opts || {};

        var bundle = makeBundle();
        bundle.require(path.join(cwd, "views", baseFile+".js"), {
            expose: baseFile
        });

        var toAdd = toBundle.adds || [];
        toAdd.forEach(function(toAdd) {
            bundle.add(path.join(cwd, toAdd.path || "lib", toAdd.name), {
                expose: toAdd.expose || toAdd.name
            });
        });
        var toRequire = toBundle.requires || [];
        toRequire.forEach(function(toReq) {
            bundle.require(path.join(cwd, toReq.path || "lib", toReq.name), {
                expose: toReq.expose || toReq.name
            });
        });

        bundle.bundle(function(err, src) {
            if (err) {throw err; }
            fs.writeFile(path.join(cwd, "public", "js",
                        baseFile+"-bundle.js"), src);
        });
        addJustRoute(baseFile);
    }

    addBundleRoute("login");
    addBundleRoute("signup");

    addJustRoute("home");
    addJustRoute("classroom");
    addJustRoute("cs999");

    return done(null, router);
});
