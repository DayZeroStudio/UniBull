"use strict";
module.exports = function(db, DataTypes) {
    return db.define("Class", {
        info: {
            type: DataTypes.STRING,
            allowNull: false
        },
        school: {
            type: DataTypes.STRING,
            allowNull: false
        },
        title: {
            type: DataTypes.STRING,
            allowNull: false
        }
    });
    /*Class hasMany Threads*/
};
