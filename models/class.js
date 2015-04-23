module.exports = (function() {
    "use strict";
    var _ = require("lodash");
    var cfg = require("../config");
    var log = cfg.log.logger;

    var classModel = {};

    var DB = require("sequelize");
    var db = new DB(cfg.db.name, cfg.db.username, cfg.db.password, {
        dialect: "postgres",
        logging: (cfg.isTest ? _.noop : log.debug.bind(log))
    });
    classModel.dbModel = db.define("Class", {
        info: {type: DB.STRING},
        school: {type: DB.STRING},
        title: {type: DB.STRING}
    });

    return classModel;
})();
