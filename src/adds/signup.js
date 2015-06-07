"use strict";

$("#loginLink").button();
$("#loginLink").click(function() {
    window.location.href="/";
});

$("#submit").button();
$("#submit").click(function() {
    var bundle = require("signup")($);
    var onSignUp = bundle.onSignUp;
    var fields = $("#signup #username, #signup #email, #signup #password, #signup #passwordconfirm, #signup input[name=role]:checked");
    return onSignUp(fields, function(err, data) {
        if (err) {
            return console.log(err);
        }
        if (data.redirect) {
            $.cookie("token", data.token, {expires: 1, path: "/"});
            window.location.replace(data.redirect);
        }
    });
});
