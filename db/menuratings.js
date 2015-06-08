"use strict";
module.exports = function(db, DataTypes) {
    return db.define("MenuRatings", {
        uuid: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV1,
            primaryKey: true
        },
        dh: {
            type: DataTypes.STRING,
            allowNull: false
        },
        item: {
            type: DataTypes.STRING,
            allowNull: false
        },
        len: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        avg: {
            type: DataTypes.FLOAT,
            allowNull: false
        },
        userRatings: {
            type: DataTypes.JSON,
            allowNull: false
        }
    });
};
