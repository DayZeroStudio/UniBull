module.exports = function(/*routePrefix*/) {
    "use strict";
    var express = require("express");
    var router = express.Router();
    var _ = require("lodash");
    var bulls = require("../models/bulls");
    var Bull = bulls.dbModel();

    var cfg = require("../config");
    var log = cfg.log;

    Bull.sync({force: cfg.isDev}).then(function() {
        return Bull.create({
            name: "Uni Bull"
        });
    });

    router.get("/", function(req, res) {
        Bull.findAll().then(function(dbData) {
            var bulls = _.map(dbData, "dataValues");
            res.json({bulls: bulls});
        });
    });

    router.get("/:name", function(req, res) {
        Bull.findAll().then(function(dbData) {
            var bulls = _.filter(_.map(dbData, "dataValues"), {name: req.params.name});
            res.json({bulls: bulls});
        });
    });

    router.post("/:name", function(req, res) {
        var body = req.body;
        var name = req.params.name;
        Bull.create({name: name})
            .then(function(bull) {
                log.info({bull: bull});
            });
        res.json({name: name, body: body});
    });

    return router;
};
