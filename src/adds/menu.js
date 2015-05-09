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

$("#menutitle").append("<h1><center>Click on a dining hall!</center></h1>");

var menuData;
var menuAllow = false;
$( ".menutab" ).tabs({ disabled: [0, 1, 2] });

$( "#menutab").hide();

$( "#selectable" ).selectable();

$( "#menutab").tabs({
    event: "mouseover",
    activate: function( event, ui ) {
        var i = ui.newTab.index();
        switch (i) {
            case 0:
                var b = menuData.breakfast;
                $( "#bf-tab").empty();
                $.each(b, function(index, value) {
                    $( "#bf-tab" ).append("<li class='ui-widget-content'>" + value + "</li>");
                });
                break;
            case 1:
                var l = menuData.lunch;
                $( "#lunch-tab").empty();
                $.each(l, function(index, value) {
                    $( "#lunch-tab" ).append("<li class='ui-widget-content'>" + value + "</li>");
                });
                break;
            case 2:
                var d = menuData.dinner;
                $( "#dinner-tab").empty();
                $.each(d, function(index, value) {
                    $( "#dinner-tab" ).append("<li class='ui-widget-content'>" + value + "</li>");
                });
                break;
            default:
                break;
        }
    }
});

function getFood(name, done) {
    var bundle = require("menu")($);
    var getMenu = bundle.getMenu;
    //return name + " Server not working \n so dummy data";
    return getMenu(name, 0, done);
}

function initialMenuLoad() {
    var dt = new Date();
    var t = dt.getHours();
    if (t >= 0 && t <= 11) {
        $( "#menutab" ).tabs({ active: 0});
        var b = menuData.breakfast;
        $( "#bf-tab").empty();
        $.each(b, function(index, value) {
            $( "#bf-tab" ).append("<li class='ui-widget-content'>" + value + "</li>");
        });
    } else if (t >= 12 && t <= 17) {
        $( "#menutab" ).tabs({ active: 1});
        var l = menuData.lunch;
        $( "#lunch-tab").empty();
        $.each(l, function(index, value) {
            $( "#lunch-tab" ).append("<li class='ui-widget-content'>" + value + "</li>");
        });
    } else {
        $( "#menutab" ).tabs({ active: 2});
        var d = menuData.dinner;
        $( "#dinner-tab").empty();
        $.each(d, function(index, value) {
            $( "#dinner-tab" ).append("<li class='ui-widget-content'>" + value + "</li>");
        });
    }
}
// function displayFood(data) {
//     $( "#menucontent").empty();
//     console.log(data.lunch);
//     $( "#menucontent" ).append("<p>" + data + "</p>");
// }

$( "#menu" ).menu({
      items: "> :not(.ui-widget-header)",
      select: function(event, ui) {
          $( "#menutab").show();
          var name = ui.item.attr("id");
          $("#menutitle").empty();
          $("#menutitle").append("<h1><center>" + name + "'s Menu</center></h1>");
          getFood(name, function(err, menu) {
              if (err) {
                  console.error(err);
              }
              menuData = menu;
              initialMenuLoad();
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
