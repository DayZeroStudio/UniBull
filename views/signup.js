module.exports = (function() {
    "use strict";
    var exports = {};

    exports.onSignUp = function($, window, fields, callback) {
        var formData = {};
        fields.each(function(i, v) {
            console.log(v);
            console.log($(v).attr("name"));
            var name = $(v).attr("name");
            formData[name] = $(v).val();
        });
        console.log(formData);
        $.ajax({
            type: "POST",
            url: "rest/user/signup",
            data: JSON.stringify(formData),
            error: function(res, textStatus, errorThrown) {
                console.log("res:" + res.responseText);
                console.log("error: " + errorThrown);
                return callback(errorThrown);
            },
            success: function(data) {
                console.log("data: ", data);
                return callback(null, data);
            },
            dataType: "json",
            contentType: "application/json"
        });
        return false;
    };

    return exports;
})();
