"use strict";
var Promise = require("sequelize").Promise;

module.exports = Promise.promisify(function(callback) {
    var cfg = require("../config");

    var DB = require("sequelize");
    var db = (cfg.db.url ? new DB(cfg.db.url, cfg.db.options)
            : new DB(cfg.db.name, cfg.db.username,
                cfg.db.password, cfg.db.options));

    var dbModels = {};

    var path = require("path");
    ["Class", "Thread", "User", "Menu"].forEach(function(model) {
        dbModels[model] = db.import(path.join(__dirname, model.toLowerCase()));
    });

    (function(ms) {
        ms.Class.hasMany(ms.Thread);
    })(dbModels);

    dbModels.db = db;

    var dbOpts = {
        force: !cfg.isProd
    };
    dbModels.Class.sync(dbOpts).then(function() {
        return dbModels.Class.create({
            title: "WebDev101",
            info: "WEB DEV WILL RUIN YOUR LIFE",
            school: "UC SHITTY CRUZ"
        });
    }).then(function() {
        return dbModels.Thread.sync(dbOpts);
    }).then(function() {
        return dbModels.User.sync(dbOpts);
    }).then(function() {
        return dbModels.Menu.sync(dbOpts);
    }).then(function() {
        return callback(null, dbModels);
    });
});
