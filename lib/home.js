/*eslint-env jquery, browser*/
/*eslint no-alert:0*/
"use strict";

//get username cookie and set as title
var username;
username = $.cookie("usernameCookie");
$("#feedtitle").append("<h1><center>" + username + "'s Feed</center></h1>");

$("#home").button();

$("#toclass").button().click(function() {
    window.location.href = "/classroom";
});

$("#toclubs").button().click(function() {
    //window.location.href = "/classroom"
    alert("Under Construction");
});

$("#toevents").button().click(function() {
    alert("Under Construction");
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

var i = 0;
for (i = 0; i < 200; i++) {
    $( "#feedcontainer" ).append("<p><b>Title</b>: (Feed #" + i + ") <br><b><i>Content</i></b><br>Author: <br> <i>#Tags</i><hr>");
}

$("#feedcontainer").jscroll({
	//autoTriggerUntil: 3
});

//$( "#feedcontainer" ).load( "/jqueryui/external/jquery/jquery.js");

function logout(name) {
		$.cookie("usernameCookie", null);
    document.cookie = name+"=;expires=Thu, 01 Jan 1970 00:00:01 GMT;";
}

$("#logout").button().click(function() {
    logout("token");
    window.location.href = "/login";
});
