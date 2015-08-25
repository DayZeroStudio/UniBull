"use strict";
var RestCollection = require("ampersand-rest-collection");
var Class = require("./class.js");

var _ = require("lodash");

module.exports = RestCollection.extend({
    model: Class,
    url: "/api/class/",
    parse: _.partial(_.get, _, "classes")
});
