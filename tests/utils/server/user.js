"use strict";

module.exports = function(UTILS, agent) {
    var _ = require("lodash");

    return {
        validUser: UTILS.validUser,
        validInstructor: UTILS.validInstructor,
        makeNewUser: function() {
            var name = _.uniqueId("newuser_");
            return {
                username: name,
                password: "password",
                email: name + "@email.com"
            };
        },
        makeInstructor: function() {
            var name = _.uniqueId("newInstructor_");
            return {
                username: name,
                password: "password",
                email: name + "@email.com",
                role: "professor"
            };
        },
        loginToApp: function(user) {
            return agent
                .post("/api/user/login")
                .send(user)
                .toPromise();
        },
        signupNewUser: function(user) {
            return agent
                .post("/api/user/signup")
                .send(user)
                .toPromise();
        },
        getUserInfo: function(userID) {
            return agent
                .get("/api/user/"+ userID)
                .toPromise();
        }
    };
};
