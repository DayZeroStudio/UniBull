module.exports = function(routePrefix, callback) {
    "use strict";
    var express = require("express");
    var router = express.Router();
    var bodyParser = require("body-parser");
    router.use(bodyParser.json());

    var classModel = require("../models/class");
    var Class = classModel.dbModel;

    var _ = require("lodash");
    function append(a, b) {return a+b; }
    var cfg = require("../config");
    //var log = cfg.log.logger;

    var publicEndpoints = _.map(["", "/"],
            _.partial(append, routePrefix));
    require("../app/auth.js").setupAuth(router, publicEndpoints);

    router.get("/", function(req, res) {
        Class.findAll().then(function(classes) {
            res.json({classes: classes});
        });
    });

    router.post("/create", function(req, res) {
        Class.create({
            info: req.body.info,
            school: req.body.school,
            title: req.body.title
        }).then(function(c) {
            res.json({class: c.get()});
        }).catch(function(err) {
            res.json({error: err.message});
        });
    });

    return Class.sync({force: !cfg.isProd}).then(function() {
        return Class.create({
            info: "test info",
            school: "test school",
            title: "test title"
        });
    }).then(function() {
        return callback(router);
    });
};
