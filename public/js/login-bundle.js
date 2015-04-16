require=(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({"login":[function(require,module,exports){
module.exports = function($, window, fields) {
    "use strict";
    var formData = {};
    fields.each(function(i, v) {
        console.log(v);
        console.log($(v).attr("name"));
        var name = $(v).attr("name");
        formData[name] = $(v).val();
    });
    console.log(formData);
    $.ajax({
        type: "POST",
        url: "rest/user/login",
        data: JSON.stringify(formData),
        error: function(res, textStatus, errorThrown) {
            console.log("res:" + res.responseText);
            console.log("error: " + errorThrown);
        },
        success: function(data) {
            console.log("data: ", data);
            window.location.replace(data.redirect);
        },
        dataType: "json",
        contentType: "application/json"
    });
    return false;
};

},{}]},{},[]);
