"use strict";

var chai = require("chai");
/*var should = */chai.should();
var request = require("supertest-as-promised");

var express = require("express");
var app = express();
app.use(require("cookie-parser")());
var utils = require("../utils").server(request, app);

require("blanket")();
describe("testing reply endpoints", function() {
    before(function() {
        return require("../../db")().then(function(dbModels) {
            return require("../../app/rest")(dbModels);
        }).then(function(router) {
            app.use(router);
        });
    });
    describe("replying to a thread", function() {
        context("given that you are enrolled in that thread's class", function() {
            context("with required info", function() {
                it("should add the reply to that thread's replies", function() {
                    //make a thread
                    var thread = utils.thread.makeNewThread();
                    var token = utils.class.token;
                    return utils.thread.submitThread("WebDev101", token, thread).then(function() {
                        //reply to thread
                        return utils.reply.replyToThread(thread.title, {
                            content: "im some content"
                        });
                    }).then(function(res) {
                        //check it was added
                        res.body.should.contain.keys("replies");
                        res.body.replies.should.be.an("array");
                    });
                });
            });
        });
    });
});
