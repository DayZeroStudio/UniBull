"use strict";
module.exports = function(models, routePrefix, callback) {
    var express = require("express");
    var router = express.Router();
    var bodyParser = require("body-parser");
    router.use(bodyParser.json());

    var _ = require("lodash");
    function append(a, b) {return a+b; }
    var cfg = require("../config");
    var log = cfg.log.logger;

    var publicEndpoints = _.map(["", "/"],
            _.partial(append, routePrefix));
    require("../app/auth.js").setupAuth(router, publicEndpoints);

    var Class = models.Class;
    var Thread = models.Thread;

    router.get("/", function(req, res) {
        log.info("GET - Get all classes");
        Class.findAll({
            include: [Thread]
        }).then(function(classes) {
            res.json({
                classes: classes
            });
        });
    });

    router.post("/create", function(req, res) {
        log.info("POST - Create a class");
        Class.create({
            info: req.body.info,
            school: req.body.school,
            title: req.body.title
        }).then(function(klass) {
            Thread.create({
                content: "some thread content"
            }).then(function(thread) {
                klass.addThread(thread).then(function() {
                    res.json({
                        class: klass.get()
                    });
                });
            });
        }).catch(function(err) {
            res.json({error: err.message});
        });
    });

    return callback(router);
};
