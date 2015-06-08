"use strict";

$("#menutitle").append("<h1><center>Click on a dining hall!</center></h1>");

var menuData;
$( ".menutab" ).tabs({ disabled: [0, 1, 2] });

$( "#menutab").hide();

$( "#selectable" ).selectable();

function stuff(tabSel, mealData) {
    $(tabSel).empty();
    $.each(mealData, function(i, val) {
        var item = $(tabSel).append($("<li></li>").addClass("ui-widget-content")
            .append($("<div></div>").html(val)).append($("<div id='rate'></div>")));
        $(item).find("div#rate").raty({
            score: 3,
            path: "images/"
        });
    });
}

$("#menutab").tabs({
    event: "click",
    activate: function( event, ui ) {
        var i = ui.newTab.index();
        switch (i) {
            case 0:
                stuff("#bf-tab", menuData.breakfast);
                break;
            case 1:
                stuff("#lunch-tab", menuData.lunch);
                break;
            case 2:
                stuff("#dinner-tab", menuData.dinner);
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
        stuff("#bf-tab", menuData.breakfast);
    } else if (t >= 12 && t <= 17) {
        $( "#menutab" ).tabs({ active: 1});
        stuff("#bf-tab", menuData.lunch);
    } else {
        $( "#menutab" ).tabs({ active: 2});
        stuff("#dinner-tab", menuData.dinner);
    }
}

$( "#menu" ).menu({
    items: "> :not(.ui-widget-header)",
    select: function(event, ui) {
        $( "#menutab").show();
        var name = ui.item.attr("id");
        $("#menutitle").empty();
        $("#menutitle").append("<h1><center>" + name + "'s Menu</center></h1>");
        getFood(name, function(err, menu) {
            if (err) {
                return console.error(err);
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

function logout() {
    $.removeCookie("usernameCookie", { expires: 1, path: "/" });
    $.removeCookie("token", { expires: 1, path: "/" });
}

$("#logout").button().click(function() {
    logout();
    window.location.href = "/login";
});
