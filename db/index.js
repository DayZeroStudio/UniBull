"use strict";

module.exports = function() {
    var Promise = require("bluebird");
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
    // Let all the models handle their associations
    Object.keys(dbModels).forEach(function(modelName) {
        if ("associate" in dbModels[modelName]) {
            dbModels[modelName].associate(dbModels);
        }
    });
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
    }).bind({}).then(function() {
        var fs = require("fs");
        this.defaults = JSON.parse(fs.readFileSync("db/defaults.json", "utf-8"));
        return this.defaults.classes;
    }).map(function(klass) {
        return dbModels.Class.create(klass);
    }).then(function() {
        return this.defaults.users;
    }).map(function(user) {
        return dbModels.User.create(user).then(function(newUser) {
            if (user.classes) {
                return Promise.resolve(user.classes).map(function(classID) {
                    dbModels.Class.find({where: {title: classID}}).then(function(klass) {
                        newUser.addClass(klass);
                    });
                });
            }
        });
    }).then(function() {
        return dbModels;
    });
};
