"use strict";
module.exports = function(db, DataTypes) {
    var Class = db.define("Class", {
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
    }, {
        classMethods: {
            associate: function(dbModels) {
                Class.hasMany(dbModels.Thread);
                Class.belongsToMany(dbModels.User, {through: dbModels.ClassesUsers});
            }
        }
    });

    return Class;
};
