"use strict";

//get username cookie and set as title
var username = $.cookie("usernameCookie");
$("#feedtitle").append("<h1><center>" + username + "'s Feed</center></h1>");

$("#home").button();

$("#toclass").button().click(function() {
    window.location.href = "/class";
});

$("#toclubs").button().click(function() {
    //window.location.href = "/classroom"
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
  }
});

for (var i = 0; i < 50; i++) {
    $( "#feedcontainer" )
    .append("<p><b>Title</b>: (Feed #" + i + ") <br><b><i>Content</i></b><br>Author: <br> <i>#Tags</i><hr>");
}

$("#feedcontainer").jscroll({
	//autoTriggerUntil: 3
});

//$( "#feedcontainer" ).load( "/jqueryui/external/jquery/jquery.js");

function logout() {
    $.cookie("usernameCookie", null);
    $.cookie("token", null);
}

$("#logout").button().click(function() {
    logout();
    window.location.href = "/login";
});
