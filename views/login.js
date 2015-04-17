module.exports = (function() {
    "use strict";
    var exports = {};

    exports.onLogin = function($, window, fields) {
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
            url: "rest/user/login",
            data: JSON.stringify(formData),
            error: function(res, textStatus, errorThrown) {
                console.log("res:" + res.responseText);
                console.log("error: " + errorThrown);
            },
            success: function(data) {
                console.log("data: ", data);
                window.location.replace(data.redirect);
            },
            dataType: "json",
            contentType: "application/json"
        });
        return false;
    };

    return exports;
})();
