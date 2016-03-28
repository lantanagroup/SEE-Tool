

exports.get = function (data, dataStores, req, res, log) {
    var query, token, response, documentStore = dataStores.DocumentStore;
    log.info("document search called");

    log.verbose(data);
    //get payload
    if (data.query) {
        query = data.query;
    }
    log.info("query = " + query);

    //TODO: validate user and group
    //validateUserAndGroup(user)

    documentStore.RankedSearch(req.session.user, query, function (error, results) {
        if (error) {
            log.error("Error on search:", error);
            res.sendError("There was an error processing the search results.");
        } else {
            //lookup and return the document
            res.send(results);
        }
    });


    log.info("search finished");
};