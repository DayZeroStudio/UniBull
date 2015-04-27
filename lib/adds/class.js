/*eslint-env browser, jquery*/
/*eslint no-alert:0*/
"use strict";

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

function logout(name) {
    $.cookie("usernameCookie", null);
    document.cookie = name+"=;expires=Thu, 01 Jan 1970 00:00:01 GMT;";
}
$("#logout").button().click(function() {
    logout("token");
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

$("#addclass").button().click(function() {
    $("#submit_wrapper").slideToggle();
});

function end_submission() {
    $("#submit_wrapper").slideUp();
    $("#title").val("");
    $("#content").val("");
}

$("#cancel").button().click(function() {
    $("#submit_wrapper").slideUp();
    $("#title").val("");
    $("#content").val("");
});

$("#submit_class").button().click(function() {
    //var title = $("#title").val();
    //var content = $("#content").val();
    var classroom = require("class");
    var onCreate = classroom.onCreate;
    var fields = $("#submitform #info, #submitform #school, #submitform #title");
    return onCreate($, fields, function(err, data) {
        if (err) {
            return console.log(err);
        }
        if (data.redirect) {
            var classTitle = $("#title").val();
            $( "#classlist" ).append("<br><a href='/class/" + classTitle + "'>" + classTitle + "</a>");
            end_submission();
        }
    });
});
