"use strict";
module.exports = {
    getAllThreads: {
        url: "/:classID",
        type: "GET",
        auth: false
    },
    getThread: {
        url: "/:classID/thread/:threadID",
        type: "GET",
        auth: false
    },
    submitThread: {
        url: "/:classID",
        type: "POST",
        auth: true
    },
    editThread: {
        url: "/:classID/thread/:threadID/edit",
        type: "PUT",
        auth: true
    },
    deleteThread: {
        url: "/:classID/thread/:threadID/delete",
        type: "DELETE",
        auth: true
    },
    flagThread: {
        url: "/:classID/thread/:threadID/flag",
        type: "POST",
        auth: true
    },
    endorseThread: {
        url: "/:classID/thread/:threadID/endorse",
        type: "POST",
        auth: true
    }
};
