"use strict";
var Promise = require("bluebird");

module.exports = function(dbModels, routePrefix) {
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

    var auth = require("../auth.js");
    var publicEndpoints = _.map(["", "/"],
            _.partial(append, routePrefix))
            .concat([/menu$/, /getRating$/]);
    auth.setupAuth(router, publicEndpoints);

    var Menu = dbModels.Menu;
    var MenuRatings = dbModels.MenuRatings;

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

    router.get("/:dh/:dtdate/menu", function(req, res) {
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
                }).catch(cfg.handleErr(res));
            }
            return res.json(dbData);
        });
    });

    router.get("/:dh/:menuItem/getRating", function(req, res) {
        MenuRatings.find({
            where: {
                dh: req.params.dh,
                item: req.params.menuItem
            }
        }).then(function(menuItem) {
            if (!menuItem) {
                return res.json({
                    avg: 0
                });
            }
            return res.json({
                avg: parseFloat(menuItem.avg).toFixed(1)
            });
        });
    });

    router.put("/:dh/:menuItem/rating", function(req, res) {
        var decoded = require("../auth").decodeRequest(req);
        var username = decoded.username;
        var rating = req.body.rating;
        var dfltUserRatings = {};
        dfltUserRatings[username] = rating;
        MenuRatings.findOrCreate({
            where: {
                dh: req.params.dh,
                item: req.params.menuItem
            }, defaults: {
                len: 1,
                avg: rating,
                userRatings: dfltUserRatings
            }
        }).spread(function(menuItem, created) {
            if (!created) {
                var len = menuItem.len;
                var avg = menuItem.avg;
                if (menuItem.userRatings.hasOwnProperty(username)) {
                    menuItem.avg = avg + (rating / len)
                        - (menuItem.userRatings[username] / len);
                    menuItem.userRatings[username] = rating;
                } else {
                    var newLen = len + 1;
                    menuItem.avg = (avg * len / newLen) + (rating / newLen);
                    menuItem.len = newLen;
                }
            }
            return menuItem.save();
        }).then(function(menuItem) {
            return res.json({
                avg: parseFloat(menuItem.avg).toFixed(1)
            });
        }).catch(cfg.handleErr(res));
    });

    return Promise.resolve(router);
};
