"use strict";
module.exports = function(db, DataTypes) {
    return db.define("Thread", {
        title: {
            type: DataTypes.STRING,
            allowNull: false
        },
        content: {
            type: DataTypes.STRING,
            allowNull: false
        }
    });
};
