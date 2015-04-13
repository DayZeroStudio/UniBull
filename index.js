"use strict";

var _ = require("lodash");
var express = require("express");
var app = express();
var ejs = require("ejs");
var path = require("path");
var bunyan = require("bunyan");
var DB = require("sequelize");

var isDev = process.env.NODE_ENV !== "production";
var log = bunyan.createLogger({
    name: "UniBull",
    src: isDev,
    serializers: {
        req: bunyan.stdSerializers.req,
        res: bunyan.stdSerializers.res
    }
});

var db = new DB("Evan", "Evan", "", {dialect: "postgres"});
var UniBullDB = db.define("UniBull", {
    name: {type: DB.STRING}
});

var extra = require("./app/extra.js");

// For automagical html page reloading
var reloadify = require("./lib/reloadify");
reloadify(app, path.join(process.cwd(), "/views"));
app.engine("html", ejs.renderFile);

app.set("views", path.join(process.cwd(), "views"));
app.set("view engine", "html");

app.get("/", function(req, res) {
    res.render("login");
});

app.get("/home", function(req, res) {
    res.render("home");
});

app.get("/bull", function(req, res) {
    UniBullDB.findAll().then(function(db_data) {
        var bulls = _.map(db_data, "dataValues");
        res.json({bulls: bulls});
    });
});

app.get("/bull/:name", function(req, res) {
    log.info("requesting bull with name: '%s'", req.params.name);
    UniBullDB.findAll().then(function(db_data) {
        var bulls = _.map(db_data, "dataValues");
        res.locals.bulls = JSON.stringify(bulls);
        res.render("bulls", {bull: req.params.name});
    });
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
    UniBullDB.sync({force: isDev}).then(function() {
        return UniBullDB.create({
            name: "[DATE YEAR=1993, MONTH=10, DAY=20"
        });
    });
});

