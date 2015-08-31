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

function ensureLoggedIn(handler) {
    return function() {
        if (!app.user.username) {
            window.history.replaceState("Login", "Login", "/login");
            app.trigger("page", new LoginPage());
            return;
        }
        handler.apply(this, arguments);
    };
}

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
    home: ensureLoggedIn(function() {
        app.trigger("page", new HomePage());
    }),

    login: function() {
        app.trigger("page", new LoginPage());
    },

    signup: function() {
        app.trigger("page", new SignupPage());
    },

    classes: ensureLoggedIn(function() {
        if (!app.allClasses) {
            app.allClasses = new Classes();
        }
        app.allClasses.fetch();
        app.trigger("page", new ClassesPage());
    }),

    addClass: ensureLoggedIn(function() {
        app.trigger("page", new AddClassPage());
    }),

    class: ensureLoggedIn(function(uuid) {
        var threads = new Threads({uuid: uuid});
        threads.fetch();
        app.trigger("page", new ClassPage({
            model: app.class,
            collection: threads
        }));
    }),

    catchAll: ensureLoggedIn(function() {
        app.trigger("page", new HomePage());
    })
});
