"use strict";
module.exports = function(db, DataTypes) {
    return db.define("Reply", {
        content: {
            type: DataTypes.STRING,
            allowNull: false
        }
    });
};
