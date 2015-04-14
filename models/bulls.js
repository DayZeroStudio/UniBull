module.exports = (function() {
    "use strict";
    var _ = require("lodash");
    var cfg = require("../config");
    var log = cfg.log.logger;
    var model = {};

    model.dbModel = _.memoize(function() {
        var DB = require("sequelize");
        var db = new DB(cfg.db.name, cfg.db.username, cfg.db.password, {
            dialect: "postgres",
            logging: (cfg.isTest ? _.identity : log.debug.bind(log))
        });
        var Bull = db.define("Bull", {
            name: {type: DB.STRING}
        });
        return Bull;
    });

    model.locals = function(query, callback) {
        var locals = {};
        locals.bull = query.bull || "bull";

        model.dbModel().findAll()
            .then(function(dbData) {
                locals.bulls = JSON.stringify(_.map(dbData, "dataValues"));
                return callback(locals);
            });
    };

    return model;
})();
