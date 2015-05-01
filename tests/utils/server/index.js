"use strict";

module.exports = function(UTILS, request, app) {
    var utils = {};

    utils.user = require("./user.js")(UTILS, request, app);
    utils.class = require("./class.js")(UTILS, request, app);
    utils.thread = require("./thread.js")(UTILS, request, app);
    utils.reply = require("./reply.js")(UTILS, request, app);

    return utils;
};
