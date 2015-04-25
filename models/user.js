module.exports = function(db, DataTypes) {
    "use strict";
    var bcrypt = require("bcrypt");
    var _ = require("lodash");
    var cfg = require("../config");

    var User = db.define("User", {
        username: {type: DataTypes.STRING},
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
        email: {type: DataTypes.STRING},
        classes: {
            type: DataTypes.ARRAY(DataTypes.STRING),
            defaultValue: [],
            validate: {
            }
        }
    }, {
        classMethods: {
            isValidUser: function(password_hash, password, callback) {
                bcrypt.compare(password, password_hash, function(err, isValid) {
                    if (err) {
                        return callback(err);
                    }
                    return callback(null, isValid);
                });
            }
        }, instanceMethods: {
            addClass: function(newClass) {
                var classes = this.getDataValue("classes");
                if (_.contains(classes, newClass)) {
                    throw Error("User is already enrolled in class: "
                            + newClass);
                }
                this.setDataValue("classes", classes.concat([newClass]));
                return this;
            }
        }
    });

    return User;
};
