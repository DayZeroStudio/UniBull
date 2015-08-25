"use strict";
var AmpersandModel = require("ampersand-model");

module.exports = AmpersandModel.extend({
    props: {
        username: "string",
        password: "string"
    },
    derived: {
    },
    url: function() {
        return "/api/user/login";
    }
});
