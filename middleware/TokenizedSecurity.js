var log = require('npmlog'),
    _ = require("underscore");

module.exports = function (){
     return function (request, response, next) {
        var user = request.session.user;

        if (!_.isNull(user) && !_.isUndefined(user)) {
            log.info("user validated");
            next();
        } else {
            log.error("Invalid session, request to " + request.originalUrl + " rejected.");
            response.send(403, "Invalid session, request rejected.");
        }
    };
};