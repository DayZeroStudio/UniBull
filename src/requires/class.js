module.exports = (function() {
    "use strict";
    var ajax = require("../utils/ajax.js");
    var exports = {};
    exports.onCreate = function($, fields, callback) {
        var formData = {};
        fields.each(function(i, v) {
            console.log(v);
            console.log($(v).attr("name"));
            var name = $(v).attr("name");
            formData[name] = $(v).val();
        });
        console.log(formData);
        ajax.postJSON($, "rest/class/create", formData, callback);
        return false;
    };
    exports.joinClass = function($, userID, classID, callback) {
        var data = { classID: classID };
        var enrollUrl = "rest/user/" + userID + "/joinClass";
        ajax.postJSON($, enrollUrl, data, callback);
    };
    return exports;
})();
