"use strict";
var FormView = require("ampersand-form-view");
var ExtendedInput = require("./input-view.js");

module.exports = FormView.extend({
    fields: function() {
        return [
            new ExtendedInput({
                name: "email",
                label: "Email",
                placeholder: "Email",
                id: "email",
                tests: []
            }),
            new ExtendedInput({
                name: "username",
                label: "Username",
                placeholder: "Username",
                id: "username",
                tests: []
            }),
            new ExtendedInput({
                name: "password",
                label: "Password",
                placeholder: "Password",
                id: "password",
                tests: []
            })
        ];
    }
});
