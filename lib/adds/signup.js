/*eslint-env browser, jquery*/
/*eslint no-alert:0*/
"use strict";

$("#loginLink").button();
$("#loginLink").click(function() {
    window.location.href="/";
});

$("#submit").button();
$("#submit").click(function() {
    var signup = require("signup");
    var onSignUp = signup.onSignUp;
    var fields = $("#myForm #username, #myForm #email, #myForm #password, #myForm #passwordconfirm");
    return onSignUp($, fields, function(err, data) {
        if (err) {
            return console.log(err);
        }
        if (data.redirect) {
            document.cookie = "token="+data.token+";max-age="+(60*15);
            window.location.replace(data.redirect);
        }
    });
});
