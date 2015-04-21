"use strict";
function uniBull(PORT, callback) {
    var _ = require("lodash");
    var express = require("express");
    var app = express();
    var fs = require("fs");
    var ejs = require("ejs");
    var path = require("path");
    var browserify = require("browserify");
    var async = require("async");

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

    app.use(express.static(path.join(cwd, "/public")));

    var bodyParser = require("body-parser");
    app.use(bodyParser.json());

    var cookieParser = require("cookie-parser");
    app.use(cookieParser());

    app.get("/", function(req, res) {
        res.render("login");
    });

    async.series([
    function(seriesCallback) {
        // Automagically app.use all rest/*.js
        fs.readdir("rest", function(err, files) {
            if (err) {throw err; }
            log.info("files:", files);
            async.each(files, function(file, eachCallback) {
                var filePath = "./rest/" + file;
                var route = "/rest/" + file.substr(0, file.indexOf("."));
                log.info("Adding REST endpoint: (" + route + ")");
                require(filePath)(route, function(router) {
                    app.use(route, router);
                    eachCallback(null);
                });
            }, function(err) {
                if (err) {
                    log.error(err);
                } else {
                    log.info("Finished adding REST endpoints");
                    seriesCallback(null);
                }
            });
        });
    },
    function(seriesCallback) {
        // Authorization - JWT
        var jwt = require("jsonwebtoken");
        var expressJwt = require("express-jwt");
        function getTokenFromRequest(req) {
            var auth = req.headers.authorization;
            var queryToken = req.query.token;
            var cookieToken = req.cookies.token;
            if (auth&& auth.split(" ")[0] === "Bearer") {
                return auth.split(" ")[1];
            } else if (queryToken
                    && queryToken.split(" ")[0] === "Bearer") {
                return queryToken.split(" ")[1];
            } else if (cookieToken
                    && cookieToken.split(" ")[0] === "Bearer") {
                return cookieToken.split(" ")[1];
            }
            return null;
        }
        var publicHtmlPages = ["/login", "/signup"];
        app.use(expressJwt({
            secret: cfg.jwt.secret,
            getToken: getTokenFromRequest,
            isRevoked: function isRevokedCallback(req, payload, done) {
                var token = getTokenFromRequest(req);
                jwt.verify(token, cfg.jwt.secret, function(err, decoded) {
                    if (err) {return done(err); }
                    return done(null, !decoded);
                });
            }
        }).unless({
            path: publicHtmlPages
        }));
        app.use(function catchAuthErrors(err, req, res, next) {
            log.error(err);
            if (err.name === "TokenExpiredError") {
                return res.status(401).json({error: err.name});
            } else if (err.name === "UnauthorizedError") {
                return res.status(401).json({error: err.name});
            }
            next();
        });

        // Automagically render all views/*.html
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
            app.get(route, function(req, res) {
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

        seriesCallback(null);
    },
    function(seriesCallback) {
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
    uniBull(process.env.PORT || 8080, function() {});
} else {
    module.exports = uniBull;
}
