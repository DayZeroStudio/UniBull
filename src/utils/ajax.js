"use strict";
module.exports = function($) {
    var _ = require("lodash");
    var exports = {};

    exports.makeJSON = function(type, url, formData, callback) {
        console.log(type, url, formData);
        $.ajax({
            type: type,
            url: url,
            data: JSON.stringify(formData),
            error: function(res, textStatus, errorThrown) {
                return callback(errorThrown);
            },
            success: function(data) {
                return callback(null, data);
            },
            dataType: "json",
            contentType: "application/json"
        });
        return false;
    };

    exports.postJSON = _.partial(exports.makeJSON, "POST");
    exports.getJSON = _.partial(exports.makeJSON, "GET");
    exports.putJSON = _.partial(exports.makeJSON, "PUT");
    exports.delJSON = _.partial(exports.makeJSON, "DELETE");
    return exports;
};
