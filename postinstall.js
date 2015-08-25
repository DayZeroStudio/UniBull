"use strict";
var slinker = require("slinker");

slinker.link({
    modules: ["config"],
    modulesBasePath: __dirname,
    symlinkPrefix: "@",
    nodeModulesPath: "./node_modules",
    onComplete: function() {
        console.log("SLINKER: Yay, my modules are linked!");
    },
    onError: function() {
        console.log("SLINKER: Oh no, my modules aren't linked!");
    }
});
