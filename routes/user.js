var router = (function() {
    "use strict";
    var express = require("express");
    var router = express.Router();
    var _ = require("lodash");
    var DB = require("sequelize");
    var bcrypt = require("bcrypt");

    var cfg = require("../config");
    var log = cfg.log;

    var db = new DB(cfg.db.name,
            cfg.db.username, cfg.db.password,
            {dialect: "postgres"});
    var User = db.define("User", {
        username: {type: DB.STRING},
        password_hash: {type: DB.STRING},
        password: {
            type: DB.VIRTUAL,
            set: function(password) {
                this.setDataValue("password", password);
                var hashed = bcrypt.hashSync(password, 10);
                this.setDataValue("password_hash", hashed);
            },
            validate: {len: [7, 64]}
        },
        email: {type: DB.STRING}
    });

    User.sync({force: cfg.isDev}).then(function() {
        return User.create({
            username: "First User",
            password: "mypasswd",
            email: "first.user@email.com"
        });
    });

    router.get("/", function(req, res) {
        log.info("GET - Get all users");
        User.findAll().then(function(dbData) {
            var users = _.chain(dbData)
                .map("dataValues");
            log.info({users: users});
            res.json({users: users});
        });
    });

    router.get("/login", function(req, res) {
        log.info("GET - Authenticate");
        User.find({where: {
            username: req.query.username
        }}).then(function(user) {
            if (user == null) {
                res.json({error: "Failed to Find user"});
                return;
            }
            bcrypt.compare(req.query.password, user.password_hash,
                    function(err, isValid) {
                        log.info(err);
                        if (isValid) {
                            res.json({user: user});
                        } else {
                            res.json({error: "Failed to Authenticate"});
                        }
                    });
        });
    });

    return router;
})();

module.exports = router;
