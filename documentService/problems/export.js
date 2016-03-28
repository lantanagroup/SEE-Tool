exports.get = function (data, dataStores, req, res, log) {

    var query, snomedProblemStore = dataStores.SnomedProblemStore;

    //get payload
    if (data.query) {
        query = data.query;
    }
    else {
        log.info("No query passed in to snomed problem search");
    }
    log.verbose("query = " + query);

    snomedProblemStore.RankedSearch(query, function (error, results) {
        if (error) {
            log.error("Error on search:", error);

            res.sendError("There was an error processing the search results.");
        } else {
            //lookup and return the document
            res.send(results);
            log.info("snomed problem search finished successfully");
        }
    });
};