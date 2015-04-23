"use strict";
module.exports = function(routePrefix, callback) {
    var express = require("express");
    var router = express.Router();
    var bodyParser = require("body-parser");
    router.use(bodyParser.json());

    var models = require("../models");
    var Class = models.Class;
    //var Thread = models.Thread;

    var _ = require("lodash");
    function append(a, b) {return a+b; }
    var cfg = require("../config");
    //var log = cfg.log.logger;

    var publicEndpoints = _.map(["", "/"],
            _.partial(append, routePrefix));
    require("../app/auth.js").setupAuth(router, publicEndpoints);

    router.get("/", function(req, res) {
        Class.findAll().then(function(classes) {
            res.json({
                classes: classes
            });
        });
    });

    router.post("/create", function(req, res) {
        Class.create({
            info: req.body.info,
            school: req.body.school,
            title: req.body.title
        }).then(function(klass) {
            res.json({
                class: klass.get()
            });
        }).catch(function(err) {
            res.json({error: err.message});
        });
    });

    Class.sync({force: !cfg.isProd}).then(function() {
        return Class.create({
            info: "test info",
            school: "test school",
            title: "test title"
        });
    }).then(function() {
        return callback(router);
    });
};
