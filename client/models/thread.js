"use strict";
var AmpersandModel = require("ampersand-model");

module.exports = AmpersandModel.extend({
    props: {
        uuid: "string",
        title: "string",
        content: "string",
        flagged: "string",
        endorsed: "string",
        classUuid: "string"
    },
    url: function() {
        console.log(this.toJSON());
        if (this.uuid) {
            return `/api/class/#{this.classUuid}/thread/#{this.uuid}`;
        } else {
            return "/api/class/" + this.classUuid;
        }
    }
});
