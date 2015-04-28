/*eslint-env browser, jquery*/
/*eslint no-alert:0*/
"use strict";

function logout(name) {
    $.cookie("usernameCookie", null);
    document.cookie = name+"=;expires=Thu, 01 Jan 1970 00:00:01 GMT;";
}

$( "#loginButton" ).button();
$( "#loginButton" ).click(function() {
    var login = require("login");
    var onLogin = login.onLogin;
    var fields = $("#myForm #username, #myForm #password");
    return onLogin($, fields, function(err, data) {
        if (err) {
            return console.log(err);
        }
        if (data.redirect) {
            document.cookie = "token="+data.token+";max-age="+(60*15);
            $.cookie("usernameCookie", $("#username").val());
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
    logout("token");
    window.location.href = "/login";
});
