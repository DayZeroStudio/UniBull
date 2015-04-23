module.exports = function(db, DataTypes) {
    "use strict";
    var bcrypt = require("bcrypt");

    var User = db.define("User", {
        username: {type: DataTypes.STRING},
        password_hash: {type: DataTypes.STRING},
        password: {
            type: DataTypes.VIRTUAL,
            set: function(password) {
                this.setDataValue("password", password);
                var hashed = bcrypt.hashSync(password, 10);
                this.setDataValue("password_hash", hashed);
            },
            validate: {len: [7, 64]}
        },
        email: {type: DataTypes.STRING}
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
        }
    });

    return User;
};
