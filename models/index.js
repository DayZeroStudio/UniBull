"use strict";
module.exports = function(callback) {
    var cfg = require("../config");

    var DB = require("sequelize");
    var db = new DB(cfg.db.name, cfg.db.username,
            cfg.db.password, cfg.db.options);

    var models = {};

    var path = require("path");
    var cwd = process.cwd();
    ["Class", "Thread", "User"].forEach(function(model) {
        models[model] = db.import(path.join(cwd, "models", model));
    });

    (function(ms) {
        ms.Class.hasMany(ms.Thread);
    })(models);

    models.db = db;

    models.Class.sync({force: !cfg.isProd}).then(function() {
        models.Thread.sync({force: !cfg.isProd}).then(function() {
            callback(models);
        });
    });
};
