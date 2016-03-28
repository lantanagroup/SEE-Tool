//updates a user
exports.post = function (data, dataStores, req, res, log) {
    
    var userStore = dataStores.UserStore;
    var updatedUser = data.user;

    userStore.updateUser(updatedUser, function (error) {
        if (error) {
            log.error("There was an error updating this user. " + error);
            res.sendError("There was an error updating this user.");
        } else {
            log.info("User updated");
            res.send({});
        }
    });
};