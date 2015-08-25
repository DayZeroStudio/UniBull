"use strict";
var app = require("ampersand-app");
var View = require("ampersand-view");
var templates = require("../templates");

module.exports = View.extend({
    template: templates.views.class,
    bindings: {
        "model.title": {
            hook: "view",
            type: "text"
        },
        "model.viewUrl": {
            hook: "view",
            type: "attribute",
            name: "href"
        }
    },
    events: {
        "click [data-hook~=view]": "viewClassClick"
    },
    viewClassClick: function() {
        console.log("VIEWING CLASS", this.model.toJSON());
        app.class = this.model;
    }
});
