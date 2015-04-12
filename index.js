"use strict";

var express = require("express");
var app = express();
var ejs = require("ejs");
var path = require("path");
var bunyan = require("bunyan");
var extra = require("./app/extra.js");

var is_dev = process.env.NODE_ENV !== "production";

var log = bunyan.createLogger({
    name: "UniBull",
    src: is_dev,
    serializers: {
        req: bunyan.stdSerializers.req,
        res: bunyan.stdSerializers.res
    }
});

var PORT = process.env.PORT || 8080;

var reloadify = require("./lib/reloadify");
reloadify(app, path.join(process.cwd(), "/views"));
app.engine("html", ejs.renderFile);

app.set("views", path.join(process.cwd(), "views"));
app.set("view engine", "html");

app.get("/", function(request, response) {
    response.render("home");
});

app.use(function(request, response) {
    response.status(404).send("UniBull cannot find that page");
});

app.use(function(err, request, response) {
    log.error(err.stack);
    response.status(500).send("You've made UniBull cry, you monster!");
});

var server = app.listen(PORT, function() {
    log.warn({extra: extra});
    var host = server.address().address;
    log.info("UniBull is now listening at http://%s:%s", host, PORT);
});

