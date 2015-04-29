"use strict";
module.exports = function(db, DataTypes) {
    return db.define("Menu", {
        name: {
            type: DataTypes.STRING,
            allowNull: false
        },
        title: {
            type: DataTypes.STRING,
            allowNull: false
        },
        breakfast: {
            type: DataTypes.ARRAY(DataTypes.STRING),
            allowNull: false
        },
        lunch: {
            type: DataTypes.ARRAY(DataTypes.STRING),
            allowNull: false
        },
        dinner: {
            type: DataTypes.ARRAY(DataTypes.STRING),
            allowNull: false
        },
        dtdate: {
            type: DataTypes.INTEGER,
            allowNull: false
        }
    });
};
