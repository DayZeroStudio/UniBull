/*globals classTitle*/
"use strict";
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

function collapsible() {
    $("#accordion").accordion({
        active: false,
        collapsible: true,
        heightStyle: "content",
        beforeActivate: function(event, ui) {
            var currHeader;
            var currContent;
             // The accordion believes a panel is being opened
            if (ui.newHeader[0]) {
                currHeader = ui.newHeader;
                currContent = currHeader.next(".ui-accordion-content");
             // The accordion believes a panel is being closed
            } else {
                currHeader = ui.oldHeader;
                currContent = currHeader.next(".ui-accordion-content");
            }
             // Since we"ve changed the default behavior, this detects the actual status
            var isPanelSelected = currHeader.attr("aria-selected") === "true";
             // Toggle the panel"s header
            currHeader.toggleClass("ui-corner-all", isPanelSelected).toggleClass("accordion-header-active ui-state-active ui-corner-top", !isPanelSelected).attr("aria-selected", ((!isPanelSelected).toString()));
            // Toggle the panel"s icon
            currHeader.children(".ui-icon").toggleClass("ui-icon-triangle-1-e", isPanelSelected).toggleClass("ui-icon-triangle-1-s", !isPanelSelected);
             // Toggle the panel"s content
            currContent.toggleClass("accordion-content-active", !isPanelSelected);
            if (isPanelSelected) { currContent.slideUp(); } else { currContent.slideDown(); }
            return false; // Cancels the default action
        }
    });
}
collapsible();

function logout() {
    $.cookie("usernameCookie", null);
    $.cookie("token", null);
}
$("#logout").button().click(function() {
    logout();
    window.location.href = "/login";
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
$(".rb").button();
$("#newpost").button().click(function() {
    $("#submit_wrapper").slideToggle();
});
$("button[data-id=replytothread]").button().click(function(thread) {
    var threadID = $(thread.currentTarget).attr("data-thread");
    console.log(threadID);
    $(".replyformwrapper[data-thread*=" + threadID + "]").slideToggle();
});
$("button[data-id=viewreplies]").button().click(function(thread) {
    var threadID = $(thread.currentTarget).attr("data-thread");
    $(".replies[data-thread*="+threadID+"]").slideToggle();
});
$("#cancel").button().click(function() {
    $("#submit_wrapper").slideUp();
    $("#title").val("");
    $("#content").val("");
});
$("button[data-id=cancelreply]").button().click(function(thread) {
    var threadID = $(thread.currentTarget).attr("data-thread");
    $(".replyformwrapper[data-thread*="+threadID+"]").slideUp();
    $(".replycontent[data-thread*="+threadID+"]").val("");
});
$("button[data-id=submitreply]").button().click(function(thread) {
    var threadID = $(thread.currentTarget).attr("data-thread");
    var content = $(".replycontent[data-thread*="+threadID+"]").val();
    console.log(content);
});

$("#submit_post").button().click(function() {
    var bundle = require("classroom")($);
    var onSubmitPost = bundle.onSubmitPost;
    var fields = $("#submitform #content, #submitform #title");
    return onSubmitPost(classTitle, fields, function(err, data) {
        if (err) { return console.log(err); }
        if (data.action) {
            $("#submit_wrapper").slideUp();
            $("#title").val("");
            $("#content").val("");
            window.location.reload();
        }
    });
});
