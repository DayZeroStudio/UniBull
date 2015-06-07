"use strict";

function logout() {
    $.removeCookie("usernameCookie", { expires: 1, path: "/" });
    $.removeCookie("token", { expires: 1, path: "/" });
}

function joinclass(classID) {
    var userID = $.cookie("usernameCookie");
    console.log("userid", userID);
    var bundle = require("class")($);
    var joinClass = bundle.joinClass;
    return joinClass(userID, classID, function(err, data) {
        if (err) { return console.log(err); }
        if (data.action) {
            console.log("joined class");
        }
    });
}

function end_submission() {
    $("#submit_wrapper").slideUp();
    $("#title").val("");
    $("#content").val("");
}

$("#container").layout({
    north: {
        enableCursorHotkey: false,
        closable: false,
        resizable: false,
        spacing_open: 0,
        spacing_closed: 0
    },
    south: {
        enableCursorHotkey: false,
        closable: false,
        resizable: false,
        spacing_open: 0,
        spacing_closed: 0
    }
});

$("#logout").button().click(function() {
    logout();
    window.location.href = "/login";
});
$("#home").button().click(function() {
    window.location.href = "/home";
});

$("#toclass").button().click(function() {
    window.location.href = "/class";
});

$("#toclubs").button().click(function() {
    alert("Under Construction");
});

$("#toevents").button().click(function() {
    alert("Under Construction");
});

$("#tomenu").button().click(function() {
    window.location.href = "/menu";
});

$("#addclass").button().click(function() {
    $("#submit_wrapper").slideToggle();
});

$(".joinclass").button().click(function(klass) {
    var classID = $(klass.currentTarget).attr("data-klass");
    joinclass(classID);
});

$("#cancel").button().click(function() {
    $("#submit_wrapper").slideUp();
    $("#title").val("");
    $("#content").val("");
});

$("#submit_class").button().click(function() {
    var bundle = require("class")($);
    var onCreate = bundle.onCreate;
    var joinClass = bundle.joinClass;
    var fields = $("#submitform #info, #submitform #school, #submitform #title");
    return onCreate(fields, function(err, data) {
        if (err) {
            return console.log(err);
        }
        if (data.redirect) {
            var classTitle = $("#title").val();
            var userID = $.cookie("usernameCookie");
            console.log("USERID", userID);
            $( "#classlist" ).append("<a href='/class/" + classTitle + "'>" + classTitle + "</a>");
            end_submission();
            return joinClass(userID, classTitle, function(err, data) {
                if (err) { return console.log(err); }
                if (data.action) {
                    console.log("joined class");
                }
            });
        }
    });
});
