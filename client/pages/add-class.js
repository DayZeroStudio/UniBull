"use strict";
var app = require("ampersand-app");
var View = require("ampersand-view");
var templates = require("../templates.js");
var AddClassForm = require("../forms/add-class.js");

module.exports = View.extend({
    pageTitle: "Add Class",
    template: templates.pages.addClass(),
    subviews: {
        addClassForm: {
            hook: "add-class-form",
            prepareView: function(el) {
                return new AddClassForm({
                    el, submitCallback: function(data) {
                        app.allClasses.create({
                            title: data.title,
                            info: data.info,
                            school: data.school
                        }, {wait: true});
                    }
                });
            }
        }
    }
});
