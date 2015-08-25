"use strict";
module.exports = function(db, DataTypes) {
    var Reply = db.define("Reply", {
        uuid: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV1,
            primaryKey: true
        },
        content: {
            type: DataTypes.STRING,
            allowNull: false
        },
        flagged: {
            type: DataTypes.ARRAY(DataTypes.STRING),
            allowNull: true
        },
        endorsed: {
            type: DataTypes.ARRAY(DataTypes.STRING),
            allowNull: true
        }
    }, {
        classMethods: {
            associate: function() {
                Reply.hasMany(Reply);
            }
        }
    });

    return Reply;
};
