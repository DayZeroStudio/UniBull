module.exports = (function() {
    "use strict";
    var exports = {};

    exports.postJSON = function($, url, formData, callback) {
        console.log(formData);
        $.ajax({
            type: "POST",
            url: url,
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
