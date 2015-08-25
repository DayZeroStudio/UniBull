"use strict";
var RestCollection = require("ampersand-rest-collection");
var Thread = require("./thread.js");

module.exports = RestCollection.extend({
    model: Thread,
    url: function() {
        return `/api/class/${this.uuid}`;
    },
    initialize: function(options) {
        this.uuid = options.uuid;
    }
});
