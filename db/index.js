"use strict";

module.exports = function() {
    var Promise = require("bluebird");
    var cfg = require("../config");

    var DB = require("sequelize");
    var db = (cfg.db.url ? new DB(cfg.db.url, cfg.db.options)
            : new DB(cfg.db.name, cfg.db.username,
                cfg.db.password, cfg.db.options));

    var dbModels = {};
    var dbOpts = {
        force: !cfg.isProd
    };

    /*
     * NOTE:
     *  - {concurrency: 1} is important to avoid deadlocks
     */
    var modelsList = ["Class", "Thread", "User", "Reply", "Menu"];
    return Promise.resolve(modelsList).map(function(model) {
        var path = require("path");
        dbModels[model] = db.import(path.join(__dirname, model.toLowerCase()));
        // NOTE: Syncing here is vital when tinkering with db tables & schemas
        return dbModels[model].sync(dbOpts);
    }, {concurrency: 1}).then(function() {
        dbModels.ClassesUsers = db.define("ClassesUsers", {});
        // Models handle their own associations
        Object.keys(dbModels).forEach(function(modelName) {
            if ("associate" in dbModels[modelName]) {
                dbModels[modelName].associate(dbModels);
            }
        });
    }).return(modelsList).map(function(modelName) {
        // We need to sync after setting all the model associations
        return dbModels[modelName].sync(dbOpts);
    }, {concurrency: 1}).bind({}).then(function() {
        // Populate the tables with data from defaults.json
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
        dbModels.db = db;
        return dbModels;
    });
};
