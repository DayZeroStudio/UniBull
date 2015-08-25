"use strict";
var FormView = require("ampersand-form-view");
var ExtendedInput = require("./input-view.js");

module.exports = FormView.extend({
    fields: function() {
        return [
            new ExtendedInput({
                name: "title",
                label: "Title",
                placeholder: "Title",
                id: "title"
            }),
            new ExtendedInput({
                name: "content",
                label: "Content",
                placeholder: "Content",
                id: "content"
            })
        ];
    }
});
