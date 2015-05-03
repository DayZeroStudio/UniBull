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
            type: DataTypes.ARRAY(DataTypes.STRING)
        },
        lunch: {
            type: DataTypes.ARRAY(DataTypes.STRING)
        },
        dinner: {
            type: DataTypes.ARRAY(DataTypes.STRING)
        },
        dtdate: {
            type: DataTypes.INTEGER,
            allowNull: false
        }
    });
};
