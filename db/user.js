"use strict";

module.exports = function(db, DataTypes) {
    var Promise = require("bluebird");
    var bcrypt = require("bcrypt");
    var verifyPasswords = Promise.promisify(bcrypt.compare);

    var cfg = require("../config");

    var User = db.define("User", {
        username: {
            type: DataTypes.STRING,
            allowNull: false
        },
        password_hash: {type: DataTypes.STRING},
        password: {
            type: DataTypes.VIRTUAL,
            set: function(password) {
                this.setDataValue("password", password);
                var hashed = bcrypt.hashSync(password, 12);
                this.setDataValue("password_hash", hashed);
            },
            validate: {len: [(cfg.isProd ? 7 : 3), 64]},
            allowNull: false
        },
        email: {
            type: DataTypes.STRING,
            allowNull: false
        }
    }, {
        classMethods: {
            associate: function(dbModels) {
                dbModels.User.belongsToMany(dbModels.Class, {through: dbModels.ClassesUsers});
                dbModels.User.hasMany(dbModels.Thread);
                dbModels.User.hasMany(dbModels.Reply);
            },
            isValidUser: Promise.method(function(password_hash, password) {
                return verifyPasswords(password, password_hash)
                    .then(function(isValid) {
                        if (!isValid) {
                            throw Error(cfg.errmsgs.invalidUserInfo);
                        }
                        return true;
                    });
            })
        }
    });

    return User;
};
