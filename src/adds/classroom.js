/*globals classTitle*/
"use strict";

var bundle = require("classroom")($);

var loadedReplies = [];

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

// function collapsible() {
//     $(".accordion").accordion({
//         active: false,
//         collapsible: true,
//         heightStyle: "content",
//         beforeActivate: function(event, ui) {
//             var currHeader;
//             var currContent;
//              // The accordion believes a panel is being opened
//             if (ui.newHeader[0]) {
//                 currHeader = ui.newHeader;
//                 currContent = currHeader.next(".ui-accordion-content");
//              // The accordion believes a panel is being closed
//             } else {
//                 currHeader = ui.oldHeader;
//                 currContent = currHeader.next(".ui-accordion-content");
//             }
//              // Since we"ve changed the default behavior, this detects the actual status
//             var isPanelSelected = currHeader.attr("aria-selected") === "true";
//              // Toggle the panel"s header
//             currHeader.toggleClass("ui-corner-all", isPanelSelected).toggleClass("accordion-header-active ui-state-active ui-corner-top", !isPanelSelected).attr("aria-selected", ((!isPanelSelected).toString()));
//             // Toggle the panel"s icon
//             currHeader.children(".ui-icon").toggleClass("ui-icon-triangle-1-e", isPanelSelected).toggleClass("ui-icon-triangle-1-s", !isPanelSelected);
//              // Toggle the panel"s content
//             currContent.toggleClass("accordion-content-active", !isPanelSelected);
//             if (isPanelSelected) { currContent.slideUp(0); } else { currContent.slideDown(0); }
//             return false; // Cancels the default action
//         }
//     });
// }
// collapsible();

function logout() {
    $.cookie("usernameCookie", null);
    $.cookie("token", null);
}
function replyLoaded(uuid) {
    console.log("checking for reply: ", uuid);
    return $.inArray(uuid, loadedReplies);
}

function convertDate(d) {
    var date = new Date(d);

    var m_array = [ "January", "February", "March", "April", "May", "June",
                   "July", "August", "September", "October", "November", "December" ];

    var month = m_array[(date.getMonth()+1) > 9 ? (date.getMonth()+1) : "0" + (date.getMonth()+1) - 1];
    var day = (date.getDate()+1) > 9 ? (date.getDate()+1) : "0" + (date.getDate()+1);
    var hours = (date.getHours()) > 9 ? (date.getHours()) : "0" + (date.getHours());
    var minutes = (date.getMinutes()) > 9 ? (date.getMinutes()) : "0" + (date.getMinutes());
    var seconds = (date.getSeconds()) > 9 ? (date.getSeconds()) : "0" + (date.getSeconds());

    var dateString = month + "/" + day + "/" + date.getFullYear() + " " + hours + ":" + minutes + ":" +
        seconds;

    return dateString;
}
function addReply(threadID, user, content, uuid, date) {
    loadedReplies.push(uuid);
    console.log(date);
    $("div[data-thread*='"+threadID+"'][name*=thread_container]")
        .append("<div class='reply_container' data-thread='"+threadID+"' name='reply_container'>"
        + "<p class='reply_content'>"+ content + "</p>"
        + "<p class='reply_author'>"+ user + "</p>"
        + "<p class='reply_postdate'>"+ date + "</p>"
        + "</div>");
}

function displayReplies(res, threadID) {
    // console.log("res", res);
    // console.log("thredID", threadID);
    var uname;
    res.threads.forEach(function(thread) {
        console.log("threadID: ", thread);
        uname = thread.User.username;
        //console.log("thread title: ", thread.title);
        if (thread.uuid === threadID) {
            thread.Replies.forEach(function(reply) {
                console.log("I get here");
                if (replyLoaded(reply.uuid) === (-1)) {
                    var date = convertDate(reply.createdAt);
                    addReply(threadID, uname, reply.content, reply.uuid, date);
                } else {
                    console.log("reply already loaded: ", reply.uuid);
                }
            });
        }
    });
}

function getReplies(threadID) {
    //make ajax call to get replies...
    var onViewReplies = bundle.onViewReplies;
    onViewReplies(classTitle, function(err, res) {
        if (err) { return console.log(err); }
        if (res) {
            displayReplies(res, threadID);
        }
    });
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
    $("#submit_wrapper").slideToggle(0);
});
$("button[name=viewcontent]").click(function(thread) {
    var threadID = $(thread.currentTarget).attr("data-thread");
    var threadContent = $(".thread_content_wrapper[data-thread*='"+threadID+"']");
    var threadAuthDate = $(".thread_auth_date[data-thread*='"+threadID+"']");
    var viewContentButton = $("button[name=viewcontent][data-thread*='"+threadID+"']");
    if (threadContent.is(":visible") && !threadAuthDate.is(":visible")) {
        viewContentButton.html("[+]");
    } else {
        viewContentButton.html("[-]");
    }
    threadContent.slideToggle(0);
    threadAuthDate.slideToggle(0);
});

$("button[name=reply]").click(function(thread) {
    var threadID = $(thread.currentTarget).attr("data-thread");
    console.log("Clicked on reply ", threadID);
    // var replyButton = $("button[name=reply][data-thread*="+threadID+"]");
    var replyForm = $(".reply_form_wrapper[data-thread*='"+threadID+"']");
    replyForm.slideToggle(0);
});

$("button[name=cancel_reply]").click(function(thread) {
    var threadID = $(thread.currentTarget).attr("data-thread");
    var replyForm = $(".reply_form_wrapper[data-thread*='"+threadID+"']");
    var replyContent = $(".reply_form_content[data-thread*='"+threadID+"'']");
    replyForm.slideUp(0);
    replyContent.val("");
});

$("button[name=submit_reply]").click(function(thread) {
    var threadID = $(thread.currentTarget).attr("data-thread");
    var threadTitle = $(thread.currentTarget).attr("data-title");
    var onSubmitReply = bundle.onSubmitReply;
    var replyForm = $(".reply_form_wrapper[data-thread*='"+threadID+"']");
    //var replyContent = $(".reply_form_content[data-thread*='"+threadID+"'']");
    var replyContent = $( "input[data-thread*='"+threadID+"']");
    console.log("reply content", replyContent);
    var replyContentCheck = $.trim(replyContent.val());
    if (replyContentCheck.length <= 0) {
        console.log("reply check", replyContentCheck);
        alert("You cannot submit an empty reply.");
        return null;
    }
    return onSubmitReply(classTitle, threadTitle, replyContent, function(err, data) {
        if (err) {
            return console.log("error: ", err);
        }
        if (data.action) {
            replyForm.slideToggle(0);
            replyContent.val("");
        }
    });

});

// $("button[data-id=submitreply]").button().click(function(thread) {
//     var threadID = $(thread.currentTarget).attr("data-thread");
//     var onSubmitReply = bundle.onSubmitReply;
//     var fields = $(".replycontent[data-thread*='"+threadID+"']");
//     // var content = fields.val();
//     return onSubmitReply(classTitle, threadID, fields, function(err, data) {
//         if (err) {
//             console.log("data error: ", data.error);
//             return console.log("error", err);
//         }
//         console.log("data", data);
//         if (data.action) {
//             // var user = $.cookie("usernameCookie");
//             $(".replyformwrapper[data-thread*='"+threadID+"']").slideToggle(0);
//             $(".replycontent[data-thread*='"+threadID+"']").val("");
//         }
//     });
// });

// $("button[name=viewreplies]").click(function(thread) {
//     var threadID = $(thread.currentTarget).attr("data-thread");
//     console.log(threadID);
// });

// $("button[name=delete]").click(function(thread) {
//     //var threadID = $(thread.currentTarget).attr("data-thread");
//     //do something with threadID;
// });

// $("button[name=report]").click(function(thread) {
//     //var threadID = $(thread.currentTarget).attr("data-thread");
//     //do something with threadID;
// });

$("button[name=viewreplies]").button().click(function(thread) {
    var threadID = $(thread.currentTarget).attr("data-thread");
    var replies = $(".replies[data-thread*='"+threadID+"']");
    if (!replies.is(":visible")) {
        getReplies(threadID);
    }
    replies.slideToggle(0);

});

$("#cancel").button().click(function() {
    $("#submit_wrapper").slideUp(0);
    $("#title").val("");
    $("#content").val("");
});

function submitPost() {
    var onSubmitPost = bundle.onSubmitPost;
    var fields = $("#submitform #content, #submitform #title");
    return onSubmitPost(classTitle, fields, function(err, data) {
        if (err) { return console.log(err); }
        if (data.action) {
            $("#submit_wrapper").slideUp(0);
            $("#title").val("");
            $("#content").val("");
            window.location.reload();
        }
    });
}
$("#submitform").submit(function(sub) {
    sub.preventDefault();
    submitPost();
});
$("#submit_post").button().click(function() {
    submitPost();
});
