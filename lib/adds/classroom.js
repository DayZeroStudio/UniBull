/*eslint-env jquery, browser*/
/*eslint no-alert:0*/
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

function logout(name) {
        $.cookie("usernameCookie", null);
    document.cookie = name+"=;expires=Thu, 01 Jan 1970 00:00:01 GMT;";
}
$("#logout").button().click(function() {
    logout("token");
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

$("#newpost").button().click(function() {
    $("#submit_wrapper").slideToggle();
});
$("#cancel").button().click(function() {
    $("#submit_wrapper").slideUp();
    $("#title").val("");
    $("#content").val("");
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
$("#submit_post").button().click(function() {
    var title = $("#title").val();
    var content = $("#content").val();
    $("#accordion").prepend("<h3>" + title + "</h3><div>" + content + "</div>")
        .accordion("destroy").accordion();
    collapsible();
    $("#submit_wrapper").slideUp();
    $("#title").val("");
    $("#content").val("");
});
collapsible();
