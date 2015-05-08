"use strict";
module.exports = function(dbModels, routePrefix) {
    var Promise = require("bluebird");
    var express = require("express");
    var router = express.Router();
    var bodyParser = require("body-parser");
    router.use(bodyParser.json());

    var _ = require("lodash");
    function append(a, b) {return a+b; }
    var cfg = require("../../config");
    var log = cfg.log.makeLogger("rest,class");

    var auth = require("../auth.js");
    var publicEndpoints = _.map(["", "/"],
            _.partial(append, routePrefix))
            .concat([/all$/]);
    auth.setupAuth(router, publicEndpoints);

    // Setup Thread routing
    return require("./thread.js")(dbModels).then(function(threadRouter) {
        return router.use(threadRouter);
    }).then(function() {
        // Setup Reply routing
        return require("./reply.js")(dbModels).then(function(replyRouter) {
            return router.use(replyRouter);
        });
    }).then(function() {
        // Setup Class routing
        var Class = dbModels.Class;
        var Thread = dbModels.Thread;

        router.get("/", function(req, res) {
            log.info("GET - Get all classes");
            Class.findAll({
                include: [Thread]
            }).then(function(classes) {
                return res.json({
                    classes: classes
                });
            });
        });

        router.post("/create", function(req, res) {
            log.info("POST - Create a class");
            Class.findOrCreate({
                where: {
                    title: req.body.title
                }, defaults: {
                    info: req.body.info,
                    school: req.body.school
                }
            }).spread(function(klass, created) {
                if (!created) {//ie found it
                    return res.status(400).json({
                        error: "Class already exists",
                        redirect: "/class/"+klass.title
                    });
                }
                return res.json({
                    class: klass.get(),
                    redirect: "/class/"+klass.title
                });
            }).catch(function(err) {
                return res.status(400).json({
                    error: err.message
                });
            });
        });

        return Promise.resolve(router);
    });
};
