"use strict";

module.exports = (function() {
    var _ = require("lodash");

    var UTILS = {};
    UTILS.validUser = {
        username: "FirstUser",
        password: "mypasswd"
    };
    UTILS.validInstructor = {
        username: "FirstInstructor",
        password: "mypasswd"
    };
    Object.freeze(UTILS);

    var utils = {};
    utils.wd = _.curry(require("./webdriver"))(UTILS);
    utils.server = _.curry(require("./server"))(UTILS);

    return utils;
})();
