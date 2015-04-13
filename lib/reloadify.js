var reloadify = (function() {
    "use strict";

    var sendevent = require("sendevent");
    var watch = require("watch");
    var uglify = require("uglify-js");
    var fs = require("fs");
    var path = require("path");

    var isDev = process.env.NODE_ENV !== "production";

    // Create && minify static JS code to be included in the page
    var polyfill = fs.readFileSync(
            path.join(__dirname, "/assets/eventsource-polyfill.js"), "utf8");
    var clientScript = fs.readFileSync(
            path.join(__dirname, "/assets/client-script.js"), "utf8");
    var script = uglify.minify(polyfill + clientScript, {fromString: true}).code;

    var reloadify = function(app, dir) {
        if (!isDev) {
            app.locals.watchScript = "";
            return;
        }
        var events = sendevent("/eventstream");
        app.use(events);
        watch.watchTree(dir, function(/*f, curr, prev*/) {
            events.broadcast({ msg: "reload" });
        });
        app.locals.watchScript = "<script>" + script + "</script>";
    };
    return reloadify;
})();

module.exports = reloadify;
