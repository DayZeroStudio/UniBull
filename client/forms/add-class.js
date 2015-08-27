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
                name: "info",
                label: "Info",
                placeholder: "Info",
                id: "info"
            }),
            new ExtendedInput({
                name: "school",
                label: "School",
                placeholder: "School",
                id: "school"
            })
        ];
    }
});
