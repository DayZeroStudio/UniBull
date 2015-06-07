"use strict";

function logout() {
    $.cookie("usernameCookie", null);
    $.cookie("token", null);
}

$( "#loginButton" ).button();
$( "#loginButton" ).click(function() {
    var bundle = require("login")($);
    var onLogin = bundle.onLogin;
    var fields = $("#signup #username, #signup #password");
    return onLogin(fields, function(err, data) {
        if (err) {
            return console.log(err);
        }
        if (data.redirect) {
            $.cookie("token", data.token, { expires: 1, path: "/" });
            $.cookie("usernameCookie", $("#username").val(), { expires: 1, path: "/" });
            window.location.href = data.redirect;
        }
    });
});

$( "#signupButton" ).button();
$( "#signupButton" ).click(function() {
    window.location.href = "/signup";
});

$("#logoutButton").button();
$("#logoutButton").click(function() {
    logout();
    window.location.href = "/login";
});
