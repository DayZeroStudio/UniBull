"use strict";
var templates = require("../templates.js");
var View = require("ampersand-view");

module.exports = View.extend({
    pageTitle: "Add Class",
    template: templates.pages.addClass(),
    subviews: {
        addClassForm: {
        }
    }
});
