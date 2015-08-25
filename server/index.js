"use strict";

//todo:
// - move to own file & eventually a npm package
// - verify route type is valid HTTP type
var doNothing = function(req, res, next) {next(); };
var routerify = function({
    auth = doNothing, beforeAuth = doNothing,
    afterAuth = doNothing, routes = [], handlers = []
}) {
    var express = require("express");
    var router = express.Router();

    for (let routeName in routes) {
        let route = routes[routeName];
        let handler = handlers[routeName];
        let auth_fn = (route.auth ? auth : doNothing);
        router[route.type.toLowerCase()](route.url, beforeAuth, auth_fn, afterAuth, handler);
    }

    return router;
};

module.exports = function(app) {
    var auth = require("./auth.js");
    auth.setupAuth(app);
    app.use(require("cookie-parser")());
    app.use(require("body-parser").json());
    return require("./db")().bind({}).then(function(dbModels) {
        this.dbModels = dbModels;
        return ["user", "class", "thread"/*, "reply"*/];
    }).map(function(path) {
        const handlers = require("./api/"+path+".js")(this.dbModels);
        const routes = require("./routes/"+path+".js");
        if (path === "thread") {
            path = "class";
        }
        app.use("/api/"+path, routerify({
            routes: routes,
            handlers: handlers,
            beforeAuth: auth.addTokenToAuthHeader,
            auth: auth.authMiddleware,
            afterAuth: auth.refreshToken
        }));
    }).then(function() {
        return Promise.resolve(app);
    });
};
