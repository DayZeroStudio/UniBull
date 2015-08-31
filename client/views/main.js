"use strict";
var app = require("ampersand-app");
var View = require("ampersand-view");
var dom = require("ampersand-dom");
var ViewSwitcher = require("ampersand-view-switcher");
var _ = require("lodash");
var templates = require("../templates");

module.exports = View.extend({
    template: templates.body(),
    autoRender: true,
    initialize: function() {
        this.listenTo(app, "page", this.handleNewPage);
    },
    events: {
        "click a[href]": "handleLinkClick"
    },
    render: function() {
        document.head.appendChild(require("domify")(templates.head()));
        this.renderWithTemplate(this);
        this.pageSwitcher = new ViewSwitcher(this.queryByHook("page-container"), {
            show: function(newView/*, oldView*/) {
                document.title = _.result(newView, "pageTitle") || app.cfg.dfltTitle;
                document.scrollTop = 0;
                dom.addClass(newView.el, "active");
                app.currentPage = newView;
            }
        });
        return this;
    },
    handleNewPage: function(view) {
        var pageTitle =_.result(view, "pageTitle");
        var isLoginOrSignupPage = _.contains(["Login", "Signup"], pageTitle);
        var isLoggedIn = app.user.username;
        // If not logged in, only show login page
        if (!isLoggedIn && !isLoginOrSignupPage) {
            return app.navigate("/login");
        // If logged in, dont show login page
        } else if (isLoggedIn && isLoginOrSignupPage) {
            return app.navigate("/home");
        }
        this.pageSwitcher.set(view);
        this.updateActiveNav();
        this.hideOrShowLoginNav();
    },
    handleLinkClick: function(e) {
        var localLinks = require("local-links");
        var localPath = localLinks.pathname(e);
        if (localPath) {
            e.preventDefault();
            app.navigate(localPath);
        }
    },
    hideOrShowLoginNav: function() {
        var path = window.location.pathname.slice(1);

        this.queryAll(".nav a[href]").forEach(function(navTag) {
            var navPath = navTag.pathname.slice(1);
            if (path === "login" || path === "") {
                if (navPath === "login") {
                    dom.show(navTag); return;
                }
            } else {
                if (navPath !== "login") {
                    dom.show(navTag); return;
                }
            }
            dom.hide(navTag);
        });
    },
    updateActiveNav: function() {
        var path = window.location.pathname.slice(1);

        this.queryAll(".nav a[href]").forEach(function(navTag) {
            var navPath = navTag.pathname.slice(1);

            if ((!navPath && !path) || (navPath && path.indexOf(navPath) === 0)) {
                dom.addClass(navTag.parentNode, "active");
            } else {
                dom.removeClass(navTag.parentNode, "active");
            }
        });
    }
});
