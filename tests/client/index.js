"use strict";
var test = require("tape");

var userTests = require("./user.js");

for (var t in userTests) {
    console.log("running: ", t);
    test(userTests[t]);
}
