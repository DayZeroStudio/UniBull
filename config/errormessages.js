"use strict";
module.exports = (function() {
    var errmsgs = {};

    errmsgs.tokenExpired = "Your session has expired, please re-login.";
    errmsgs.unauthorized = "Unauthorized!";
    errmsgs.userAlreadyExists = "That username is already taken, please try another.";
    errmsgs.userNotEnrolled = "That user is not enrolled in that class.";
    errmsgs.missingDbEnvVars = "Missing DB_NAME and/or DB_USERNAME. Put them in your ~/.bashrc";
    errmsgs.invalidUserInfo = "Invalid User credentials, please try again.";
    errmsgs.userAlreadyEnrolled = function(klass) {
        return "That User is already enrolled in '"+klass+"'.";
    };
    errmsgs.missingReqInfo = "Please submit all required information.";

    return errmsgs;
})();
