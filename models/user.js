module.exports = (function() {
    "use strict";
    var _ = require("lodash");
    var cfg = require("../config");
    var log = cfg.log.logger;
    var bcrypt = require("bcrypt");

    var UserModel = {};

    var DB = require("sequelize");
    var db = new DB(cfg.db.name, cfg.db.username, cfg.db.password, {
        dialect: "postgres",
        logging: (cfg.isTest ? _.identity : log.debug.bind(log))
    });
    UserModel.dbModel = db.define("User", {
        username: {type: DB.STRING},
        password_hash: {type: DB.STRING},
        password: {
            type: DB.VIRTUAL,
            set: function(password) {
                this.setDataValue("password", password);
                var hashed = bcrypt.hashSync(password, 10);
                this.setDataValue("password_hash", hashed);
            },
            validate: {len: [7, 64]}
        },
        email: {type: DB.STRING}
    });

    UserModel.isValidUser = function(password_hash, password, callback) {
            bcrypt.compare(password, password_hash,
                    function(err, isValid) {
                        if (err) {
                            return callback(err);
                        }
                        return callback(null, isValid);
                    }
            );
    };

    return UserModel;
})();
