module.exports = (function() {
    "use strict";
    var exports = {};
    var ajax = require("../lib/ajax.js");
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

    return exports;
})();
