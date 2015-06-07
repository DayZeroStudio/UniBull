"use strict";

function logout() {
    $.removeCookie("usernameCookie", { expires: 1, path: "/" });
    $.removeCookie("token", { expires: 1, path: "/" });
}

$( "#loginButton" ).button();
$( "#loginButton" ).click(function() {
    var bundle = require("login")($);
    var onLogin = bundle.onLogin;
    var fields = $("#myForm #username, #myForm #password");
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
