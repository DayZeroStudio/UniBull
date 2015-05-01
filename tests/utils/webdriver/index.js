"use strict";

module.exports = function(UTILS, baseUrl) {
    var utils = {};
    var _ = require("lodash");

    utils.user = _.curry(require("./user.js"))(UTILS, baseUrl);

    return utils;
};
