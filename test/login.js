/*eslint no-underscore-dangle:0, curly:0, no-unused-vars:0, no-unused-expressions:0*/
"use strict";

var chai = require("chai");
chai.should();
var sinon = require("sinon");
var _ = require("lodash");

var cfg = require("../config");
var log = cfg.log.logger;

var login = require("../views/login.js");

describe("views/login.js", function() {
    context("when the user submits a login form", function() {
        it("should make an ajax call", function() {
            var fields = {each: _.identity};
            var jq = {ajax: _.identity};
            var window = {
                location: {
                    replace: sinon.spy()
                }
            };
            sinon.stub(jq, "ajax")
                .yieldsTo("success", {redirect: "SUCCESS"});

            login(jq, window, fields);

            window.location.replace.firstCall.args[0]
                .should.equal("SUCCESS");
            jq.ajax.firstCall.args[0].should.contain({
                type: "POST",
                data: "{}",
                dataType: "json",
                contentType: "application/json"
            });
            jq.ajax.calledWithMatch(sinon.match(function(value) {
                return value.url.should.match(/login$/);
            }));
        });
    });
});
