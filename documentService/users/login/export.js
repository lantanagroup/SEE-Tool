
exports.post = function (data, dataStores, req, res, log) {
    var userId;

    if (data.userId) {
        //get payload
        userId = data.userId;

        dataStores.UserStore.getUserById(userId, function (error, user) {
            if (error) {
                log.error("An error occurred while attempting to login. " + error);
                res.send(500, "An error occurred while attempting to login. " + error);
            } else if (user == null){
                log.warn(userId + " does not exist. Request denied.");
                res.send(401, "User does not exist.");
            } else {
                log.verbose("Login successful for " + userId);

                req.session.user = user;

                res.send( user );
            }
        });
    }
    else if (req.session.user) {        // User is already logged in
        res.send(req.session.user);
    }
    else {
        log.warn("Call to " + req.originalUrl + " is missing userName parameter.");
        res.missingParameters("userName");
    }
};