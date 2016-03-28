

exports.get = function (data, dataStores, req, res, log) {
    var query;
    var util = require('util');

    if (data) {
        log.verbose(util.inspect(data, false, null));
        //get payload
        if (data.query) {
            query = data.query;
        }
        else {
            log.info("No query passed in to medication search");
        }
        log.info("query = " + query);
    }

    dataStores.MedicationStore.RankedSearch(query, function (error, results) {
        if (error) {
            log.error("Error on search: ", error);

            res.sendError("There was an error processing the search results.");
        } else {
            //lookup and return the document
            res.send(results);
        }
    });
};