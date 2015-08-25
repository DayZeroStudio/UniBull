"use strict";
var templates = require("../templates.js");
var View = require("ampersand-view");

module.exports = View.extend({
    pageTitle: "Home",
    template: templates.pages.home()
});
