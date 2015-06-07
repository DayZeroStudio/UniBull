"use strict";
module.exports = function(db, DataTypes) {
    var SignupCodes = db.define("SignupCodes", {
        code: {
            type: DataTypes.STRING,
            allowNull: false
        }
    });

    return SignupCodes;
};
