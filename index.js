"use strict";

var express = require("express");
var app = express();
var fs = require("fs");
var ejs = require("ejs");
var path = require("path");

var cfg = require("./config");
var log = cfg.log;

var extra = require("./app/extra.js");

// For automagical html page reloading
var reloadify = require("./lib/reloadify");
reloadify(app, path.join(process.cwd(), "/views"));
app.engine("html", ejs.renderFile);

app.set("views", path.join(process.cwd(), "views"));
app.set("view engine", "html");

var bodyParser = require("body-parser");
app.use(bodyParser.json());

app.get("/", function(req, res) {
    res.render("login");
});

app.get("/home", function(req, res) {
    res.render("home");
});

fs.readdirSync("routes").forEach(function(file) {
    var route = "./routes/" + file;
    log.info("Adding route: (" + route + ")");
    var routeApp = require(route);
    app.use("/" + file.substr(0, file.indexOf(".")), routeApp);
});

app.use(function(req, res) {
    res.status(404).send("UniBull cannot find that page");
});

app.use(function(err, req, res) {
    log.error(err.stack);
    res.status(500).send("You've made UniBull cry, you monster!");
});

var PORT = process.env.PORT || 8080;
var server = app.listen(PORT, function() {
    log.warn({extra: extra});
    var host = server.address().address;
    log.info("UniBull is now listening at http://%s:%s", host, PORT);
});

