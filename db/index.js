"use strict";

module.exports = function() {
    var cfg = require("../config");

    var DB = require("sequelize");
    var db = (cfg.db.url ? new DB(cfg.db.url, cfg.db.options)
            : new DB(cfg.db.name, cfg.db.username,
                cfg.db.password, cfg.db.options));

    var dbModels = {};

    var path = require("path");
    ["Class", "Thread", "User", "Reply", "Menu"].forEach(function(model) {
        dbModels[model] = db.import(path.join(__dirname, model.toLowerCase()));
    });

    dbModels.ClassesUsers = db.define("ClassesUsers", {});
    (function(dbm) {
        dbm.Class.hasMany(dbm.Thread);
        dbm.Thread.hasMany(dbm.Reply);

        dbm.Class.belongsToMany(dbm.User, {through: dbm.ClassesUsers});
        dbm.User.belongsToMany(dbm.Class, {through: dbm.ClassesUsers});

        dbm.User.hasMany(dbm.Thread);
        dbm.User.hasMany(dbm.Reply);
    })(dbModels);
    dbModels.db = db;

    var dbOpts = {
        force: !cfg.isProd
    };
    return dbModels.ClassesUsers.sync(dbOpts)
    .then(function() {
        return dbModels.Class.sync(dbOpts);
    }).then(function() {
        return dbModels.User.sync(dbOpts);
    }).then(function() {
        return dbModels.Thread.sync(dbOpts);
    }).then(function() {
        return dbModels.Menu.sync(dbOpts);
    }).then(function() {
        return dbModels.Reply.sync(dbOpts);
    }).then(function() {
        return dbModels.Class.create({
            title: "WebDev101",
            info: "WEB DEV WILL RUIN YOUR LIFE",
            school: "UC SHITTY CRUZ"
        }).then(function() {
            return dbModels.Class.create({
                title: "TestClass",
                info: "for testing purposes",
                school: "UC NOT SO SHITTY CRUZ"
            });
        });
    }).then(function() {
        return dbModels;
    });
};
