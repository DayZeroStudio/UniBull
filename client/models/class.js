"use strict";
var AmpersandModel = require("ampersand-model");

module.exports = AmpersandModel.extend({
    props: {
        uuid: "string",
        info: "string",
        school: "string",
        title: "string"
    },
    session: {
        showAddThread: "boolean"
    },
    derived: {
        viewUrl: {
            deps: ["uuid"],
            fn: function() {
                return "/class/" + this.uuid;
            }
        }
    }
});
