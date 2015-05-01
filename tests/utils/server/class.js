"use strict";

module.exports = function(UTILS, request, app) {
    var utils = {};
    var _ = require("lodash");

    utils.validUser = UTILS.validUser;

    var cfg = require("../../../config");
    var jwt = require("jsonwebtoken");
    var validUser = {
        username: "FirstUser",
        password: "mypasswd"
    };
    var token = "Bearer "+jwt.sign(validUser, cfg.jwt.secret);
    utils.token = token;

    utils.makeNewClass = function() {
        var id = _.uniqueId();
        return {
            info: "info_"+id,
            school: "school_"+id,
            title: "title_"+id
        };
    };

    utils.createClass = function(klass) {
        return request(app)
            .post("/rest/class/create")
            .set("Authorization", token)
            .send(klass)
            .expect(200)
            .then(function(res) {
                return res.body;
            });
    };

    utils.joinClass = function(classID) {
        return request(app)
            .post("/rest/user/"+utils.validUser.username+"/joinClass")
            .send({classID: classID})
            .set("Authorization", token)
            .expect(200)
            .then(function(res) {
                return [res.body, token];
            });
    };

    return utils;
};
