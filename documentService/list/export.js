
exports.get = function (data, dataStores, req, res, log) {
    var filter, response, documentStore = dataStores.DocumentStore;
    log.info("list called");
    //get payload
    if (data && data.filter) {
        filter = data.filter;
    }

    //lookup and return the document
    documentStore.getDocumentList(req.session.user, filter, function (error, documentList) {
        if (error) {
            log.error("Error on document list: ", error);

            res.sendError("There was an error retrieving the document list");
        }
        else {
            res.send(documentList);
        }
    });
};

exports.delete = function (data, dataStores, req, res, log) {
    log.info("remove all service called.");

    log.info("calling documentStore.removeAll");
    dataStores.DocumentStore.removeAll(function (err) {
        if (err) {
            log.error(err);
            res.sendError("An error occurred during remove the documents");
        }
        else {
            log.info("Remove all complete");
            res.send({});
        }
    });
};
