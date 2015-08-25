"use strict";
var templates = require("../templates.js");
var app = require("ampersand-app");
var View = require("ampersand-view");
var ClassView = require("../views/class.js");
var CollectionRenderer = require("ampersand-collection-view");

module.exports = View.extend({
    pageTitle: "Classes",
    template: templates.pages.classes,
    subviews: {
        allClasses: {
            hook: "all-classes",
            prepareView: function(el) {
                return new CollectionRenderer({
                    el,
                    view: ClassView,
                    collection: app.allClasses
                });
            }
        }
    },
    events: {
        "click button[data-hook=add-class]": "navToAddClass"
    },
    navToAddClass: function() {
        console.log("navToAddClass");
        app.navigate("/add-class");
    }
});
