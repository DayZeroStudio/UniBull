"use strict";
var View = require("ampersand-view");
var CollectionRenderer = require("ampersand-collection-view");

var templates = require("../templates.js");
var ThreadView = require("../views/thread.js");
var AddThreadForm = require("../forms/add-thread.js");
var _ = require("lodash");
var toggleClass = require("amp-toggle-class");

module.exports = View.extend({
    pageTitle: function() {
        return "Class " + this.model.title;
    },
    template: templates.pages.class,
    initialize: function(opts) {
        this.threads = opts.collection;
    },
    events: {
        "click [data-hook=add-thread]": "addThread"
    },
    addThread: function() {
        toggleClass(this.queryByHook("add-thread-form"), "hidden", false);
        toggleClass(this.queryByHook("add-thread"), "hidden", true);
    },
    subviews: {
        threadsList: {
            hook: "threads-list",
            prepareView: function(el) {
                return new CollectionRenderer({
                    el, view: ThreadView,
                    collection: this.threads
                });
            }
        },
        addThreadForm: {
            hook: "add-thread-form",
            prepareView: function(el) {
                return new AddThreadForm({
                    el, submitCallback: function(data) {
                        console.log("data", data);
                        var id = _.uniqueId();
                        this.threads.create({
                            classUuid: this.threads.uuid,
                            title: "thread_title_"+id,
                            content: "thread_content_"+id
                        }, {wait: true});
                        toggleClass(this.queryByHook("add-thread-form"), "hidden", true);
                        toggleClass(this.queryByHook("add-thread"), "hidden", false);
                    }.bind(this)
                });
            }
        }
    }
});
