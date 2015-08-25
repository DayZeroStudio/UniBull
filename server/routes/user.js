"use strict";
module.exports = {
    getAllUsers: {
        url: "/",
        type: "GET",
        auth: false
    },
    login: {
        url: "/login",
        type: "POST",
        auth: false
    },
    signup: {
        url: "/signup",
        type: "POST",
        auth: false
    },
    restricted: {
        url: "/restricted",
        type: "GET",
        auth: true
    },
    getUserInfo: {
        url: "/:userID",
        type: "GET",
        auth: true
    },
    joinClass: {
        url: "/joinClass",
        type: "POST",
        auth: true
    }
};
