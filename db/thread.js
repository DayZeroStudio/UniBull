"use strict";
module.exports = function(db, DataTypes) {
    var Thread = db.define("Thread", {
        title: {
            type: DataTypes.STRING,
            allowNull: false
        },
        content: {
            type: DataTypes.STRING,
            allowNull: false
        }
    }, {
        classMethods: {
            associate: function(dbModels) {
                Thread.hasMany(dbModels.Reply);
            }
        }
    });

    return Thread;
};
