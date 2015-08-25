"use strict";
var app = require("ampersand-app");
var templates = require("../templates.js");
var View = require("ampersand-view");
var SignupForm = require("../forms/signup.js");

module.exports = View.extend({
    pageTitle: "Signup",
    template: templates.pages.signup(),
    subviews: {
        signupForm: {
            hook: "user-signup",
            prepareView: function(el) {
                return new SignupForm({
                    model: app.user,
                    el: el,
                    submitCallback: function(data) {
                        require("superagent")
                            .post("/api/user/signup")
                            .send(data)
                            .end(function(err, res) {
                                if (err) {
                                    console.log("error", err, res);
                                    return;
                                }
                                app.user.username = data.username;
                                app.user.password = data.password;
                                console.log("success", res);
                                app.navigate("/home");
                            });
                    }
                });
            }
        }
    }
});
