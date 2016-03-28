

exports.get = function (data, dataStores, req, res, log) {

    dataStores.UserStore.retrieveAssigningAuthorityList(data.groupIdentifier, function (error, list) {
        if (!error) { //success
            res.send(list);
        } else { //failure
            log.error(error);
            res.sendError("There was an error retrieving the Assigning Authority List");
        }
    });

};