"use strict";
module.exports = function($) {
    var ajax = require("../utils/ajax.js")($);
    var exports = {};

    exports.onSubmitPost = function(classID, fields, callback) {
        var formData = {};
        fields.each(function(i, v) {
            var name = $(v).attr("name");
            formData[name] = $(v).val();
        });
        var restEndpoint = "/rest/class/" + classID + "/submit";
        ajax.postJSON(restEndpoint, formData, callback);
        return false;
    };
    exports.onSubmitReply = function(classID, threadID, fields, callback) {
        var formData = {};
        fields.each(function(i, v) {
            var name = $(v).attr("name");
            formData[name] = $(v).val();
        });
        var restEndpoint = "/rest/class/"+classID+"/thread/"+threadID+"/reply";
        ajax.postJSON(restEndpoint, formData, callback);
        return false;
    };
    exports.onViewReplies = function() {
        var restEndpoint = "";
        ajax.getJSON(restEndpoint);
    };
    return exports;
};
