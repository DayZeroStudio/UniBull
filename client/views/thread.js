"use strict";
var View = require("ampersand-view");
var templates = require("../templates");

module.exports = View.extend({
    template: templates.views.thread,
    bindings: {
        "model.title": {
            hook: "thread-title",
            type: "text"
        },
        "model.content": {
            hook: "thread-content",
            type: "text"
        }
    }
});
