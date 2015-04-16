module.exports = function(routePrefix, callback) {
    "use strict";
    // For Routing
    var express = require("express");
    var router = express.Router();
    var bodyParser = require("body-parser");
    router.use(bodyParser.json());

    // Utility
    var _ = require("lodash");
    function append(a, b) {return a+b; }
    var cheerio = require("cheerio");
    var request = require("superagent");

    // App
    var cfg = require("../config");
    var log = cfg.log.logger;

    var DB = require("sequelize");
    var db = new DB(cfg.db.name, cfg.db.username, cfg.db.password, {
        dialect: "postgres",
        logging: (cfg.isTest ? _.identity : log.debug.bind(log))
    });
    var Menu = db.define("Menu", {
        name: {type: DB.STRING},
        title: {type: DB.STRING},
        breakfast: {type: DB.ARRAY(DB.STRING)},
        lunch: {type: DB.ARRAY(DB.STRING)},
        dinner: {type: DB.ARRAY(DB.STRING)},
        dtdate: {type: DB.INTEGER}
    });

    router.get("/:dh/:dtdate", function(req, res) {
        log.info("GET - Menu from %s +T%d", req.params.dh, req.params.dtdate);
        Menu.find({where: {
            name: req.params.dh,
            dtdate: req.params.dtdate
        }}).then(function(dbData) {
            if (!dbData) {
                log.error("FAILED");
                return res.status(500).json({success: false});
            }
            return res.json(_.omit(dbData.get(), ["id", "updatedAt", "createdAt"]));
        });
    });

    var base_UCSC_dh_url = "http://nutrition.sa.ucsc.edu/menuSamp.asp?myaction=read";
    var dhToUrl = _.chain({
        nine: "30",
        eight: "30",
        cowell: "05",
        porter: "25",
        crown: "20"
    }).mapValues(_.curry(append)(base_UCSC_dh_url+"&locationNum=")).value();
    log.warn("urls:", dhToUrl);

    return Menu.sync({force: !cfg.isProd}).then(function() {
        request.get(dhToUrl.nine)
            .end(function(err, res) {
                if (err) {
                    throw new Error("Failed to get menu");
                }
                var $ = cheerio.load(res.text);

                var title = $("title").text();
                log.warn("title:", title);

                var htmlMenu = $("td").filter(function isValidElem() {
                    var width = $(this).attr("width");
                    var valign = $(this).attr("valign");
                    return _.includes(["30%", "50%", "100%"], width)
                        && valign === "top";
                });

                log.warn("htmlMenu:", htmlMenu.length);

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
                });

                var menu = _.reduce(meals, _.merge);

                menu.title = title;
                menu.dtdate = 0;
                menu.name = "nine";
                log.warn("meals:", _.keys(menu));

                Menu.create(menu);
                return callback(router);
            });
    });
};

