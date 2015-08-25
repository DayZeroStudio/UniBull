"use strict";
var InputView = require("ampersand-input-view");
var templates = require("../templates.js");

module.exports = InputView.extend({
    template: templates.includes.formInput,
    initialize: function(opts) {
        InputView.prototype.initialize.apply(this, arguments);
        this.id = opts.id;
    }
});
