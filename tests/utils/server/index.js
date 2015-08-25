"use strict";

module.exports = function(UTILS, agent) {
    var utils = {};

    function CustomError(err) {
        Error.captureStackTrace(this, this.constructor);
        this.name = this.constructor.name;

        this.message = err.toString() + ":\n\n "
            + JSON.parse(err.text).stack;
    } require("util").inherits(CustomError, Error);

    utils.handleErr = function(fn) {
        return function() {
            return fn.apply(fn, arguments).catch(function(err) {
                if (err.response && err.response.error) {
                    throw new CustomError(err.response.error);
                }
                throw err;
            });
        };
    };

    utils.user = require("./user.js")(UTILS, agent);
    utils.class = require("./class.js")(UTILS, agent);
    utils.thread = require("./thread.js")(UTILS, agent);
    utils.reply = require("./reply.js")(UTILS, agent);
    utils.menu = require("./menu.js")(UTILS, agent);

    return utils;
};
