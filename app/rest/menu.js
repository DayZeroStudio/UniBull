"use strict";
var Promise = require("bluebird");

module.exports = function(dbModels) {
    var express = require("express");
    var router = express.Router();
    var bodyParser = require("body-parser");
    router.use(bodyParser.json());

    var _ = require("lodash");
    function append(a, b) {return a+b; }
    var cheerio = require("cheerio");
    var request = Promise.promisifyAll(require("superagent"));
    require("date-utils");

    var cfg = require("../../config");
    var log = cfg.log.makeLogger("menu,dh");

    var Menu = dbModels.Menu;

    var base_UCSC_dh_url = "http://nutrition.sa.ucsc.edu/"
        + "menuSamp.asp?myaction=read";
    var dhToUrl = _.chain({
        nine: "30",
        eight: "30",
        cowell: "05",
        porter: "25",
        crown: "20"
    }).mapValues(_.curry(append)(base_UCSC_dh_url+"&locationNum=")).value();

    function getMenuForDh(dhName, dtdate) {
        var date = Date.today().addDays(dtdate);
        var dhUrl = dhToUrl[dhName] + "&dtdate=" + date.toFormat("M/D/YYYY");
        log.debug("CONNETING TO: ", dhUrl);
        return request.getAsync(dhUrl)
            .then(function(res) {
                var $ = cheerio.load(res.text);

                var title = $("title").text();
                log.debug("title:", title);

                var htmlMenu = $("td").filter(function isValidElem() {
                    var width = $(this).attr("width");
                    var valign = $(this).attr("valign");
                    return _.includes(["30%", "50%", "100%"], width)
                        && valign === "top";
                });
                log.debug("htmlMenu:", htmlMenu.length);

                var meals = htmlMenu.map(function() {
                    var mealName = $(this).find(".menusampmeals")
                        .text().toLowerCase();
                    var mealMenu = $(this).find(".menusamprecipes")
                        .map(function() {
                            return $(this).text();
                        }).get();
                    var meal = {};
                    meal[mealName] = mealMenu;
                    return meal;
                }).get();
                log.debug("meals:", meals);

                var menu = _.reduce(meals, _.merge);
                menu.title = title;
                menu.date = date;
                menu.name = dhName;
                log.debug("menu.keys:", _.keys(menu));

                return Menu.create(menu).then(function() {
                    return menu;
                });
            });
    }

    router.get("/:dh/:dtdate", function(req, res) {
        var dh = req.params.dh;
        var dtdate = parseInt(req.params.dtdate);
        log.info("GET - Menu from %s +T%d", dh, dtdate);
        Menu.find({where: {
            name: dh,
            date: Date.today().addDays(dtdate)
        }}, {raw: true}).then(function(dbData) {
            if (!dbData) {
                return getMenuForDh(dh, dtdate).then(function(menu) {
                    res.json(menu);
                });
            }
            return res.json(dbData);
        });
    });

    return Promise.resolve(router);
};
