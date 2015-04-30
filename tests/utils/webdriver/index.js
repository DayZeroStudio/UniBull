"use strict";

module.exports = function(baseUrl) {
    var utils = {};
    var _ = require("lodash");

    utils.user = _.curry(require("./user.js"))(baseUrl);

    return utils;
};
