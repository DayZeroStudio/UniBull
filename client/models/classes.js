"use strict";
var RestCollection = require("ampersand-rest-collection");
var Class = require("./class.js");

module.exports = RestCollection.extend({
    model: Class,
    url: "/api/class/",
    ajaxConfig: {
        afterParse: "classes"
    }
});
