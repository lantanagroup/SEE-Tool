

exports.get = function (data, dataStores, req, res, log) {
    var documentId = data.id;

    if (!documentId) res.missingParameters("id");

    //lookup and return the locks
    dataStores.DocumentStore.findAllLocksForDocument(req.session.user, documentId, function (error, locks) {
        if (error) {
            log.error("Error on document! ", error);

            res.sendError("There was an error locating the locks for this document.");
        }
        else {
            log.info("Locks retrieved, sending to client.");
            res.send(locks);
        }
    });
};