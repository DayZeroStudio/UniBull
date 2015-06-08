"use strict";

module.exports = function(UTILS, agent) {
    var utils = {};

    utils.user = require("./user.js")(UTILS, agent);
    utils.class = require("./class.js")(UTILS, agent);
    utils.thread = require("./thread.js")(UTILS, agent);
    utils.reply = require("./reply.js")(UTILS, agent);
    utils.menu = require("./menu.js")(UTILS, agent);

    return utils;
};
