"use strict";

var chai = require("chai");
chai.should();
var sinon = require("sinon");
var _ = require("lodash");

var cfg = require("../../config");
cfg.coverage();
describe("testing front end login module", function() {
    context("when the user submits a login form", function() {
        // Wrapping the test function with sinon.test is important,
        // use it, and call this.[spy|stub|mock]()
        // so that things get restored once the test is done.
        it("it should trigger an ajax call", sinon.test(function() {
            var fields = {each: _.identity};
            var jq = {ajax: _.identity};
            sinon.stub(jq, "ajax").yieldsTo("success", {
                redirect: "SUCCESS"
            });
            var callback = this.spy();
            this.stub(console, "log");

            var login = require("../../src/requires/login.js")(jq).onLogin;
            login(fields, callback); // UNIT UNDER TEST

            callback.firstCall.args[1]
                .should.deep.equal({redirect: "SUCCESS"});
            jq.ajax.firstCall.args[0].should.contain({
                type: "POST",
                data: "{}",
                dataType: "json",
                contentType: "application/json"
            });
            jq.ajax.calledWithMatch(sinon.match(function(value) {
                return value.url.should.match(/login$/);
            }));
        }));
    });
});
