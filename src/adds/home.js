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
    if ((i % 2) === 0) {
        $( "#feedcontainers" ).append("<div id='feedcontainer'><a id='title'>Neeraj got a job at Costco!)</a>"
        + "<p id='content'>So I was walking down the block with my old watch and realized that it was a good time to eat pizza."
        + " But I was no where near a pizza store so I had to make a decision:"
        + " Should I go to a store to pick up the raw ingredients to make my own pizza?"
        + " Or should I order a Pizza? When I make this decision I have to make even more decisions!"
        + " For example, If I choose to make my own pizza, I have to decide on what ingredients to buy."
        + " Or If I choose to order a pizza, I have to choose what brand of pizza to order from!"
        + " This is why life is tough!</p>"
        + "<p id='author'>@Author_"+ i + "</p>"
        + "<p id='postdate'>May 7th 2015 Mon 4:22 PM</p>"
        + "</div>");
    } else {
        $( "#feedcontainers" ).append("<div id='feedcontainer'>"
        + "<a id='title'>Title: (Feed #" + i+ ")</a>"
        + "<p id='content'>Content for feed #" + i + ": Some content</p>"
        + "<p id='author'>@Author_"+ i + "<p>"
        + "<p id='postdate'>May 7th 2015 Mon 4:22 PM</p>"
        + "</div>");
    }

}

$("#feedcontainers").jscroll({
	//autoTriggerUntil: 3
});

//$( "#feedcontainers" ).load( "/jqueryui/external/jquery/jquery.js");

function logout() {
    $.cookie("usernameCookie", null);
    $.cookie("token", null);
}

$("#logout").button().click(function() {
    logout();
    window.location.href = "/login";
});
