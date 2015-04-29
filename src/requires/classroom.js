module.exports = (function() {
    "use strict";
    var ajax = require("../utils/ajax.js");
    var exports = {};
    exports.onSubmitPost = function($, classID, fields, callback) {
        var formData = {};
        fields.each(function(i, v) {
            console.log(v);
            console.log($(v).attr("name"));
            var name = $(v).attr("name");
            formData[name] = $(v).val();
        });
        console.log(formData);
        var restEndpoint = "/rest/class/" + classID + "/submit";
        console.log("rest endpoint", restEndpoint);
        ajax.postJSON($, restEndpoint, formData, callback);
        return false;
    };

    return exports;
})();
