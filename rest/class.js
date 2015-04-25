"use strict";
var Promise = require("sequelize").Promise;

module.exports = Promise.promisify(function(models, routePrefix, callback) {
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
        Class.findOrCreate({
            where: {
                title: req.body.title
            }, defaults: {
                info: req.body.info,
                school: req.body.school
            }
        }).spread(function(klass, created) {
            if (!created) {//ie found it
                return res.json({
                    error: "Class already exists",
                    redirect: "/class/"+klass.title
                });
            }
            return res.json({
                class: klass.get(),
                redirect: "/class/"+klass.title
            });
        }).catch(function(err) {
            res.json({error: err.message});
        });
    });

    router.post("/:classID/submit", function(req, res) {
        var title = req.body.title;
        var content = req.body.content;
        var classID = req.params.classID;
        Class.find({
            where: {title: classID}
        }).then(function(klass) {
            return [klass, Thread.create({
                title: title,
                content: content
            })];
        }).spread(function(klass, thread) {
            return [klass, klass.addThread(thread)];
        }).spread(function(klass) {
            return klass.getThreads({}, {raw: true});
        }).then(function(threads) {
            return res.json({
                threads: threads
            });
        });
    });

    return callback(null, router);
});
