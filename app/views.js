"use strict";
var Promise = require("sequelize").Promise;

module.exports = Promise.promisify(function setupHtmlPages(dbModels, done) {
    var path = require("path");

    var fs = require("fs");
    var cfg = require("../config");
    var log = cfg.log.logger;

    var express = require("express");
    var router = express.Router();

    var Class = dbModels.Class;

    var publicEndpoints = ["/login", "/signup"];
    require("../app/auth.js").setupAuth(router, publicEndpoints);

    var browserify = require("browserify");
    function makeBundle() {
        return browserify({
            basedir: path.join(__dirname, "../views")
        });
    }

    function addJustRoute(baseFile, options) {
        var getLocals = options.getLocals || function() {return Promise.resolve({}); };
        router.get("/"+baseFile, function(req, res) {
            getLocals().then(function(locals) {
                res.locals = locals;
                res.render(baseFile);
            });
        });
        var middleware = options.middleware;
        if (middleware) {
            router.use("/"+baseFile, middleware);
        }
    }
    // Refactor middlware into opts
    function addBundleRoute(baseFile, options) {
        var opts = options || {};

        var bundle = makeBundle();

        var toAdds = opts.adds || [];
        toAdds.forEach(function(toAdd) {
            var dirPath = toAdd.path || path.join("src", "adds");
            bundle.add(path.join(__dirname, "..", dirPath, toAdd.name));
        });
        var toRequires = opts.requires || [];
        toRequires.forEach(function(toReq) {
            var dirPath = toReq.path || path.join("src", "requires");
            bundle.require(path.join(__dirname, "..", dirPath, toReq.name), {
                expose: toReq.expose || toReq.name
            });
        });

        bundle.bundle(function(err, src) {
            if (err) {throw err; }
            fs.writeFile(path.join(__dirname, "../public", "js",
                        baseFile+"-bundle.js"), src);
        });

        var shouldAddRoute = opts.addRoute || true;
        if (shouldAddRoute) {
            var router = opts.router || undefined;
            var getLocals = opts.getLocals || function() {return Promise.resolve({}); };
            addJustRoute(baseFile, {
                middleware: router,
                getLocals: getLocals
            });
        }
    }

    addBundleRoute("login", {
        adds: [{name: "login.js"}],
        requires: [{name: "login.js", expose: "login"}]
    });
    addBundleRoute("signup", {
        adds: [{name: "signup.js"}],
        requires: [{name: "signup.js", expose: "signup"}]
    });
    addBundleRoute("home", {
        adds: [{name: "home.js"}]
    });

    // Setup for "/class/*"
    (function(router) {
        router.get("/:classID", function(req, res) {
            var classID = req.params.classID;
            log.warn("classID:", classID);
            res.locals.classID = classID;
            res.render("tmpl/classroom");
        });
        addBundleRoute("classroom", {
            addRoute: false,
            requires: [{name: "classroom.js", expose: "classroom"}],
            adds: [{name: "classroom.js"}]
        });
        addBundleRoute("class", {
            getLocals: function() {
                return Class.findAll({}, {
                    raw: true
                }).then(function(classes) {
                    return {classes: classes};
                });
            },
            router: router,
            requires: [{name: "class.js", expose: "class"}],
            adds: [{name: "class.js"}]
        });
    })(express.Router());

    addBundleRoute("menu", {
        adds: [{name: "menu.js"}]
    });

    return done(null, router);
});
