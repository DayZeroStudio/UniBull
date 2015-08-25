"use strict";
var app = require("ampersand-app");
var Router = require("ampersand-router");

var LoginPage = require("./pages/login.js");
var SignupPage = require("./pages/signup.js");
var HomePage = require("./pages/home.js");
var ClassesPage = require("./pages/classes.js");
var ClassPage = require("./pages/class.js");
var AddClassPage = require("./pages/add-class.js");

var Classes = require("./models/classes.js");
var Threads = require("./models/threads.js");

module.exports = Router.extend({
    routes: {
        "": "login",
        "home": "home",
        "login": "login",
        "signup": "signup",
        "classes": "classes",
        "add-class": "addClass",
        "class/:id": "class",
        "(*path)": "catchAll"
    },

    // ------- ROUTE HANDLERS ---------
    home: function() {
        app.trigger("page", new HomePage());
    },

    login: function() {
        app.trigger("page", new LoginPage());
    },

    signup: function() {
        app.trigger("page", new SignupPage());
    },

    classes: function() {
        if (!app.allClasses) {
            app.allClasses = new Classes();
        }
        app.allClasses.fetch();
        app.trigger("page", new ClassesPage());
    },

    addClass: function() {
        app.trigger("page", new AddClassPage());
    },

    class: function(uuid) {
        var threads = new Threads({uuid: uuid});
        threads.fetch();
        app.trigger("page", new ClassPage({
            model: app.class,
            collection: threads
        }));
    },

    catchAll: function() {
        app.trigger("page", new HomePage());
    }
});
