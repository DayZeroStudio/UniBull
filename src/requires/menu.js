"use strict";
module.exports = function($) {
    var ajax = require("../utils/ajax.js")($);
    var exports = {};

    exports.getMenu = function(dh, dtdate, callback) {
        ajax.getJSON("/rest/menu/"+dh+"/"+dtdate+"/menu", {}, callback);
        return false;
    };

    exports.getRatings = function(dh, menuitem, callback) {
        ajax.getJSON("/rest/menu/"+dh+"/"+menuitem + "/getRating", {}, callback);
        return false;
    };

    return exports;
};
