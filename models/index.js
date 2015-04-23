"use strict";
module.exports = (function() {
    var cfg = require("../config");

    var DB = require("sequelize");
    var db = new DB(cfg.db.name, cfg.db.username,
            cfg.db.password, cfg.db.options);

    var models = {};

    var path = require("path");
    var cwd = process.cwd();
    ["Class", "Thread", "User"].forEach(function(model) {
        var Model = db.import(path.join(cwd, "models", model));
        models[model] = Model;
    });

    models.db = db;

    return models;
})();
