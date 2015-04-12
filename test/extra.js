"use strict";

var chai = require("chai");
var should = chai.should();

var extra = require("../app/extra");

describe("app/extra", function(){
    before(function(){ /* ... */ });
    after(function(){ /* ... */ });
    beforeEach(function(){ /* ... */ });
    afterEach(function(){ /* ... */ });

    describe("#life", function(){
        context("when life is drøle", function(){
            it("should exist", function(){
                should.exist(extra.life);
                should.not.exist(extra.drole);
            });
            it("should return \"drøle\"", function(){
                extra.life().should.equal("drøle");
            });
            it("should not throw an error", function(){
                (function(){
                    extra.life();
                }).should.not.throw();
            });
        });
    });
});
