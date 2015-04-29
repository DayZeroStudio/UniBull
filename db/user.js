module.exports = function(db, DataTypes) {
    "use strict";
    var Promise = require("sequelize").Promise;
    var bcrypt = require("bcrypt");
    var verifyPasswords = Promise.promisify(bcrypt.compare);

    var _ = require("lodash");
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
            validate: {len: [(cfg.isProd ? 7 : 3), 64]}
        },
        email: {
            type: DataTypes.STRING
        },
        classes: {
            type: DataTypes.ARRAY(DataTypes.STRING),
            defaultValue: [],
            validate: {}
        }
    }, {
        classMethods: {
            isValidUser: Promise.method(function(password_hash, password) {
                return verifyPasswords(password, password_hash)
                    .then(function(isValid) {
                        if (!isValid) {
                            throw Error(cfg.errmsgs.invalidUserInfo);
                        }
                        return true;
                    });
            })
        }, instanceMethods: {
            addClass: Promise.method(function(newClass) {
                var classes = this.getDataValue("classes");
                if (_.contains(classes, newClass)) {
                    throw Error(cfg.errmsgs.userAlreadyEnrolled(newClass));
                }
                this.setDataValue("classes", classes.concat([newClass]));
                return this;
            })
        }
    });

    return User;
};
