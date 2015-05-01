"use strict";

var chai = require("chai");
chai.should();
var request = require("supertest-as-promised");
var _ = require("lodash");

var app = require("express")();

describe("testing menu endpoints", function() {
    this.timeout(5000);
    before(function() {
        return require("../../db")().then(function(dbModels) {
            return require("../../app/rest")(dbModels);
        }).then(function(router) {
            app.use(router);
        });
    });
    describe("when getting the menu", function() {
        context("from nine for today", function() {
            it("should contain a title, name, and meals", function() {
                return request(app)
                    .get("/rest/menu/nine/0")
                    .expect(200)
                    .then(function(res) {
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
                    });
            });
        });
    });
});
