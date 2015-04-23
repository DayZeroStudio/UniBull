"use strict";
module.exports = function(db, DataTypes) {
    return db.define("Thread", {
        content: {type: DataTypes.STRING}
    });
};
