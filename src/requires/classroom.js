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
        console.log("onSubmitReply");
        return false;
    };
    exports.onViewReplies = function(classID, threadID, callback) {
        var restEndpoint = "/rest/class/"+classID+"/thread/"+threadID+"/all";
        ajax.getJSON(restEndpoint, {}, callback);
        return false;
    };
    exports.onSubmitPostEdit = function(classID, threadID, fields, callback) {
        var formData = {};
        fields.each(function(i, v) {
            var name = $(v).attr("name");
            formData[name] = $(v).val();
            console.log("req = ", $(v).val());
        });
        var restEndpoint = "/rest/class/"+classID+"/thread/"+threadID+"/edit";
        ajax.putJSON(restEndpoint, formData, callback);
        return false;
    };
    exports.onDelThread = function(classID, threadID, fields, callback) {
        var formData = {};
        fields.each(function(i, v) {
            var name = $(v).attr("name");
            formData[name] = $(v).val();
        });
        var restEndpoint = "/rest/class/"+classID+"/thread/"+threadID+"/delete";
        ajax.delJSON(restEndpoint, formData, callback);
        return false;
    };
    return exports;
};
