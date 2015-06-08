"use strict";
module.exports = function(UTILS, agent) {
    var utils = {};

    utils.validUser = UTILS.validUser;

    utils.rateItem = function(dh, menuItem, rating) {
        return agent
            .put("/rest/menu/"+dh+"/"+menuItem+"/rating/")
            .send({rating: rating})
            .toPromise();
    };

    return utils;
};
