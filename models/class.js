"use strict";
module.exports = function(db, DataTypes) {
    return db.define("Class", {
        info: {type: DataTypes.STRING},
        school: {type: DataTypes.STRING},
        title: {type: DataTypes.STRING}
    });
};
