"use strict";
module.exports = function($) {
    var ajax = require("../utils/ajax.js")($);
    var exports = {};

    exports.getMenu = function(dh, dtdate, callback) {
        ajax.getJSON("/rest/menu/"+dh+"/"+dtdate+"/menu", {}, callback);
        return false;
    };

    return exports;
};
