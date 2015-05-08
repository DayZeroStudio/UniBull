"use strict";

//get username cookie and set as title
// var username;
// username = $.cookie("usernameCookie");
// $( document ).ready(function() {
//     var bundle = require("menu")($);
//     var getMenu = bundle.getMenu;
//     return getMenu("nine", 0, function(err, data) {
//         if (err) {
//             return console.log(err);
//         }
//         console.log(data);
//     });
// });

$("#menutitle").append("<h1><center>#CollegeName is serving the following today:</center></h1>");

function getFood(name, done) {
    var bundle = require("menu")($);
    var getMenu = bundle.getMenu;
    //return name + " Server not working \n so dummy data";
    return getMenu(name, 0, done);
}

function displayFood(data) {
    $( "#menucontent").empty();
    $( "#menucontent" ).append("<p>" + JSON.stringify(data) + "</p>");
}

$( "#menu" ).menu({
      items: "> :not(.ui-widget-header)",
      select: function(event, ui) {
          var name = ui.item.attr("id");
          getFood(name, function(err, menu) {
              if (err) {
                  console.error(err);
              }
              displayFood(menu);
          });
      }
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
  },
  west: {
    enableCursorHotkey: false,
    closable: false,
    resizable: false,
    spacing_open: 0,
    spacing_closed: 0
  }
});

$( "#places" ).accordion({
     collapsible: true
   });

function logout(name) {
		$.cookie("usernameCookie", null);
    document.cookie = name+"=;expires=Thu, 01 Jan 1970 00:00:01 GMT;";
}

$("#logout").button().click(function() {
    logout("token");
    window.location.href = "/login";
});
