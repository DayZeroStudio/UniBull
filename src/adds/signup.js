"use strict";

$("#loginLink").button();
$("#loginLink").click(function() {
    window.location.href="/";
});

$("#submit").button();
$("#submit").click(function() {
    var bundle = require("signup")($);
    var onSignUp = bundle.onSignUp;
    var fields = $("#myForm #username, #myForm #email, #myForm #password, #myForm #passwordconfirm");
    return onSignUp(fields, function(err, data) {
        if (err) {
            return console.log(err);
        }
        if (data.redirect) {
            document.cookie = "token="+data.token+";max-age="+(60*15);
            $.cookie("token", data.token, {expires: 1, path: "/"});
            window.location.replace(data.redirect);
        }
    });
});
