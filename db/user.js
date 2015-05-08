"use strict";

module.exports = function(db, DataTypes) {
    var Promise = require("bluebird");
    var bcrypt = require("bcrypt");
    var verifyPasswords = Promise.promisify(bcrypt.compare);

    var cfg = require("../config");

    var User = db.define("User", {
        uuid: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV1,
            primaryKey: true
        },
        username: {
            type: DataTypes.STRING,
            allowNull: false
        },
        password_hash: {
            type: DataTypes.STRING,
            get: function() {
                return "error: non-db functions cannot access 'password_hash'";
            }
        },
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
        },
        role: {
            type: DataTypes.ENUM("student", "ta", "professor", "moderator", "admin", "superuser", "root"),
            allowNull: false,
            defaultValue: "student"
        }
    }, {
        classMethods: {
            associate: function(dbModels) {
                dbModels.User.belongsToMany(dbModels.Class, {through: dbModels.ClassesUsers});
                dbModels.User.hasMany(dbModels.Thread);
                dbModels.User.hasMany(dbModels.Reply);
            }
        },
        instanceMethods: {
            isValidUser: Promise.method(function(maybe_password) {
                var password_hash = this.getDataValue("password_hash");
                return verifyPasswords(maybe_password, password_hash)
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
