"use strict";
var _ = require("lodash");

function uniBull(PORT, callback) {
    var express = require("express");
    var app = express();
    var ejs = require("ejs");
    var path = require("path");

    var cwd = process.cwd();
    var cfg = require("./config");
    var log = cfg.log.logger;

    // For automagical HTML page reloading
    var reloadify = require("./lib/reloadify");
    reloadify(app, path.join(cwd, "views"));
    app.engine("html", ejs.renderFile);

    // From now on, when using res.render("str"),
    // it will lookup views/str.html
    app.set("views", path.join(cwd, "views"));
    app.set("view engine", "html");

    app.use(express.static(path.join(cwd, "public")));

    app.get("/", function(req, res) {
        res.render("login");
    });

    var async = require("async");
    async.series([
    function(done) {
        require("./models")(function(models) {
            require("./app/rest.js")(models, function(err, router) {
                if (err) {return done(err); }
                app.use(router);
                return done();
            });
        });
    },
    function(done) {
        require("./app/views.js")(function(err, router) {
            if (err) {return done(err); }
            app.use(router);
            return done();
        });
    },
    function setupErrorHandlers(seriesCallback) {
        //Error Handlers
        app.use(function(req, res) {
            res.status(404).send("UniBull cannot find that page");
        });
        app.use(function(err, req, res) {
            log.error(err.stack);
            res.status(500).send("You've made UniBull cry, you monster!");
        });
        seriesCallback(null);
    }]);

    //Start the server
    var server = app.listen(PORT, function() {
        var host = server.address().address;
        log.info("UniBull is now listening at http://%s:%s", host, PORT);
    });
    callback(app, server);
}

if (require.main === module) {
    uniBull(process.env.PORT || 8080, _.noop);
} else {
    module.exports = uniBull;
}
