"use strict";
module.exports = (function() {
    var ajax = require("../utils/ajax.js");
    var exports = {};
    exports.onSignUp = function($, fields, callback) {
        var formData = {};
        fields.each(function(i, v) {
            console.log(v);
            console.log($(v).attr("name"));
            var name = $(v).attr("name");
            formData[name] = $(v).val();
        });
        console.log(formData);
        ajax.postJSON($, "rest/user/signup", formData, callback);
        return false;
    };

    return exports;
})();
