"use strict";
var app = require("ampersand-app");
var FormView = require("ampersand-form-view");
var ExtendedInput = require("./input-view.js");

module.exports = FormView.extend({
    fields: function() {
        return [
            new ExtendedInput({
                name: "username",
                label: "Username",
                placeholder: "Username",
                value: (app.cfg.isProd ? "" : "FirstUser"),
                id: "username",
                tests: []
            }),
            new ExtendedInput({
                name: "password",
                label: "Password",
                placeholder: "Password",
                value: (app.cfg.isProd ? "" : "mypasswd"),
                id: "password",
                tests: []
            })
        ];
    }
});
