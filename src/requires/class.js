"use strict";
module.exports = function($) {
    var ajax = require("../utils/ajax.js")($);
    var exports = {};

    exports.onCreate = function(url, fields, callback) {
        var formData = {};
        fields.each(function(i, v) {
            var name = $(v).attr("name");
            formData[name] = $(v).val();
        });
        ajax.postJSON("rest/class/create", formData, callback);
        return false;
    };

    exports.joinClass = function(userID, classID, callback) {
        var data = { classID: classID };
        var enrollUrl = "rest/user/" + userID + "/joinClass";
        ajax.postJSON(enrollUrl, data, callback);
    };

    return exports;
};
