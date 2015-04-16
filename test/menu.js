/*eslint curly:0, no-unused-vars:0, no-unused-expressions:0*/
"use strict";

var chai = require("chai");
chai.should();
var request = require("supertest");
var _ = require("lodash");

var app = require("express")();

var cfg = require("../config");
var log = cfg.log.logger;

var routePrefix = "/rest/menu";
describe("<"+routePrefix+">", function() {
    before(function(done) {
        require(".."+routePrefix)(routePrefix, function(router) {
            app.use(routePrefix, router);
            done();
        });
    });
    describe("when getting the menu", function() {
        context("from nine for today", function() {
            it("should contain a title, name, and meals", function(done) {
                request(app)
                    .get(routePrefix + "/nine/0")
                    .expect(200)
                    .expect(function(res) {
                        res.body.should
                            .contain.keys("title", "name", "dtdate");
                        var meals = _(res.body)
                            .pick(["breakfast", "lunch", "dinner"])
                            .values().value();
                        meals.should.have.length.above(1);
                        _.forEach(meals, function(meal) {
                            meal.should.be.an("array");
                            meal.should.have.length.above(1);
                        });
                    }).end(done);
            });
        });
    });
});

