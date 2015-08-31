/* eslint no-new:0 */
"use strict";
function unibull(PORT) {
    var cfg = require("@config");
    var Promise = require("bluebird");
    var express = require("express");
    var app = express();
    app.set("view engine", "jade");

    var helmet = require("helmet");
    app.use(helmet.xssFilter());
    app.use(helmet.nosniff());

    var serveStatic = require("serve-static");
    app.use(serveStatic(cfg.fixPath("public")));

    // Enable spacemonkey tests
    if (!cfg.isProd) {
        app.use(serveStatic(cfg.fixPath("tests/assets")));
        app.use(serveStatic(cfg.fixPath("tests/spacemonkey")));

        app.use(helmet.xframe());

        app.get("/test*", require("semi-static")({
            folderPath: cfg.fixPath("tests/spacemonkey"),
            root: "/test",
            passReq: true
        }));
    }

    app.use(function(req, res, next) {
        res.cookie("config", JSON.stringify(cfg.client));
        next();
    });

    require("babel/register");
    return require("./server")(app).then(function() {
        var Moonboots = require("moonboots-express");
        new Moonboots({
            server: app,
            moonboots: {
                jsFileName: cfg.dfltTitle,
                cssFileName: cfg.dfltTitle,
                main: cfg.fixPath("./client/app.js"),
                developmentMode: cfg.isDev,
                timingMode: cfg.isDev,
                sourceMaps: cfg.isDev,
                libraries: [],
                stylesheets: [
                    cfg.fixPath("stylesheets/bootstrap.css"),
                    cfg.fixPath("stylesheets/app.css")
                ],
                browserify: {
                    debug: cfg.isDev,
                    transform: [require("babelify")]
                },
                beforeBuildJS: function() {
                    var tmplizer = require("templatizer");
                    tmplizer(cfg.fixPath("templates"), cfg.fixPath("client/templates.js"));
                },
                beforeBuildCSS: function(done) {
                    if (cfg.isDev) {
                        require("stylizer")({
                            infile: cfg.fixPath("stylesheets/app.styl"),
                            outfile: cfg.fixPath("stylesheets/app.css"),
                            development: true
                        }, done);
                    } else {
                        done();
                    }
                }
            }
        });

        var appListen = Promise.promisify(app.listen, app);
        return appListen(PORT).then(function() {
            console.log("NOW LISTENING ON PORT", PORT);
            return app;
        });
    });
}

function run_cmd(cmd, args, std_out) {
    var spawn = require("child_process").spawn;
    var child = spawn(cmd, args);
    child.stdout.on("data", function(data) { std_out(data); });
}

if (require.main === module) {
    var PORT = process.env.PORT || 8080;
    unibull(PORT).then(function() {
        var monkey = process.env.MONKEY;
        if (monkey === undefined) { return; }
        console.log("SPACEMONKEY SHENANIGANS ENGAGED");
        run_cmd("open", ["http://localhost:"+PORT+"/test?name="+monkey], console.log);
    });
} else {
    module.exports = unibull;
}
