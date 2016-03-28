
exports.get = function (payload, dataStores, req, res, log) {
    var query, routeStore = dataStores.RouteStore;
    log.info("medication route search called");

    routeStore.getAll(function (error, results) {
        if (error) {
            log.error("Error getting medication routes: ", error);

            res.sendError("There was an error processing the search results.");
        }
        else {
            log.info("Medication routes found: " + results.length);
            res.send({ results: results });
        }
    });
    log.info("search finished");
};