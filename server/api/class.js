"use strict";
module.exports = function(dbModels) {
    var _ = require("lodash");
    var cfg = require("@config");
    var log = cfg.log.makeLogger("rest,class");

    var {Class: Class, Thread: Thread} = dbModels;

    return _.mapValues({
        getAllClasses: function(req, res) {
            log.info("GET - Get all classes");
            return Class.findAll({
                include: [Thread]
            }).then(function(classes) {
                return res.json({classes: classes});
            });
        },

        /**
         * Required:
         * - query: {action}
         * - body: {title, info, school}
         *
         * Info:
         * - action: #{create}
         */
        postClass: function(req, res) {
            var action = req.query.action;
            if (action === "create") {
                log.info("POST - Create a class");
                return Class.findOrCreate({
                    where: {
                        title: req.body.title
                    }, defaults: {
                        info: req.body.info,
                        school: req.body.school
                    }
                }).spread(function(klass, created) {
                    if (!created) {//ie found it
                        throw new Error("Class already exists");
                    }
                    return res.json({
                        class: klass.get(),
                        redirect: "/class/"+klass.title
                    });
                });
            }
            return Promise.reject(new Error(`Action '${action}' not supported`));
        }
    }, cfg.wrapWithErrorHandler);
};
