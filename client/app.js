"use strict";
var app = require("ampersand-app");
var config = require("clientconfig");
var Router = require("./router");
var _ = require("lodash");

var User = require("./models/user.js");
var MainView = require("./views/main.js");

// for debug in console
window.app = app;
window._ = _;

app.extend({
    cfg: config,
    router: new Router(),
    user: new User(),
    init: function() {
        this.mainView = new MainView({
            el: document.body
        });
        this.router.history.start({ pushState: true });
    },
    navigate: function(page) {
        var url = (page.charAt(0) === "/") ? page.slice(1) : page;
        this.router.history.navigate(url, {
            trigger: true
        });
    }
});

require("domready")(_.bind(app.init, app));
