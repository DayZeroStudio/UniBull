"use strict";

var chai = require("chai");
chai.should();
var request = require("supertest-as-promised");
var _ = require("lodash");

var app = require("express")();
var agent = request.agent(app);
var utils = require("../utils").server(agent);
var cfg = require("../../config");

cfg.coverage();
describe("testing menu endpoints", function() {
    this.timeout(15000);
    before(function() {
        return require("../../db")().then(function(dbModels) {
            return require("../../app/rest")(dbModels);
        }).then(function(router) {
            app.use(router);
        });
    });
    describe.skip("when getting the menu", function() {
        context("from nine for today", function() {
            it("should contain a title, name, and meals", function() {
                return request(app)
                    .get("/rest/menu/nine/0")
                    .then(function(res) {
                        res.statusCode.should.equal(200);
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
    describe("rating an item for nine/ten's menu", function() {
        var user;
        beforeEach(function() {
            user = utils.user.makeNewUser();
            return utils.user.signupNewUser(user);
        });
        context("(a newly rated item)", function() {
            it("should correctly update that item's avg rating", function() {
                return utils.menu.rateItem("nine", "asdf", 5.0).then(function(res) {
                    res.statusCode.should.equal(200);
                    res.body.avg.should.equal("5.0");
                    return request(app)
                        .get("/rest/menu/nine/asdf/getRating");
                }).then(function(res) {
                    res.statusCode.should.equal(200);
                    res.body.avg.should.equal("5.0");
                });
            });
        });
        context("(a previously rated item)", function() {
            beforeEach(function() {
                return utils.menu.rateItem("nine", "fdsa", 5.0);
            });
            it("should correctly update that item's avg rating", function() {
                return utils.menu.rateItem("nine", "fdsa", 3.2)
                    .then(function(res) {
                        res.statusCode.should.equal(200);
                        res.body.avg.should.equal("3.2");
                    });
            });
        });
        context("(already rated by others)", function() {
            beforeEach(function() {
                return utils.menu.rateItem("nine", "ewt", 4).then(function() {
                    return utils.user.signupNewUser(utils.user.makeNewUser());
                });
            });
            it("should correctly update that item's avg rating", function() {
                return utils.menu.rateItem("nine", "ewt", 2).then(function(res) {
                    res.statusCode.should.equal(200);
                    res.body.avg.should.equal("3.0");
                });
            });
        });
    });
});
