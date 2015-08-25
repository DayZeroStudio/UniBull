"use strict";
var app = require("ampersand-app");
var templates = require("../templates.js");
var View = require("ampersand-view");
var LoginForm = require("../forms/login.js");

module.exports = View.extend({
    pageTitle: "Login",
    template: templates.pages.login(),
    subviews: {
        loginForm: {
            hook: "user-login",
            prepareView: function(el) {
                return new LoginForm({
                    el, model: app.user,
                    submitCallback: function(data) {
                        app.user.username = data.username;
                        app.user.password = data.password;
                        app.user.save(data, {
                            wait: true,
                            success: function(model, res) {
                                console.log("success", res);
                                app.navigate("/home");
                            },
                            error: function(model, res, opts) {
                                console.log("error", res, opts);
                            }
                        });
                    }
                });
            }
        }
    }
});
