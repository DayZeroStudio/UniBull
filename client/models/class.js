"use strict";
var AmpersandModel = require("ampersand-model");
var _ = require("lodash");

module.exports = AmpersandModel.extend({
    props: {
        uuid: "string",
        info: "string",
        school: "string",
        title: "string"
    },
    derived: {
        viewUrl: {
            deps: ["uuid"],
            fn: function() {
                return "/class/" + this.uuid;
            }
        }
    },
    sync: function(method, model, options) {
        console.log(options);
        var sync = require("ampersand-sync");
        var modelUrl = _.result(model, "url");
        model.url = modelUrl + "?action=create";
        return sync.apply(this, [method, model, options]);
    }
});
