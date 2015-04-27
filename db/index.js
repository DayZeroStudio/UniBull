"use strict";
var Promise = require("sequelize").Promise;

module.exports = Promise.promisify(function(callback) {
    var cfg = require("../config");

    var DB = require("sequelize");
    var db = (cfg.db.url ? new DB(cfg.db.url, cfg.db.options)
            : new DB(cfg.db.name, cfg.db.username,
                cfg.db.password, cfg.db.options));

    var models = {};

    var path = require("path");
    var cwd = process.cwd();
    ["Class", "Thread", "User"].forEach(function(model) {
        models[model] = db.import(path.join(cwd, "db", model));
    });

    (function(ms) {
        ms.Class.hasMany(ms.Thread);
    })(models);

    models.db = db;

    var dbOpts = {
        force: !cfg.isProd
    };
    models.Class.sync(dbOpts).then(function() {
        models.Thread.sync(dbOpts).then(function() {
            models.User.sync(dbOpts).then(function() {
                callback(null, models);
            });
        });
    });
});
