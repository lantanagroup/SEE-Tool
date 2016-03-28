

exports.post = function (data, dataStores, req, res, log) {
    var response,
        documentStore = dataStores.DocumentStore,
        DocumentStatusCode = require("../../../Model/Enum/enum.js").DocumentStatusCode,
        previousStatusCode;

    log.info("document changestatus called");
    if (data && data.DocumentId && data.DocumentStatusCode) {
        if (data.DocumentStatusCode !== DocumentStatusCode.DRAFT) {  //we can't change status code back to draft
            //lookup and return the document
            documentStore.changeStatus(data.DocumentId, data.DocumentStatusCode, function () {
                //send successful response                
                res.send({});
            });
        } else {
            var err = "Invalid call to document changestatus. Cannot change status to DRAFT.";
            log.error(err);
            res.send(400, "Status cannot be changed to DRAFT");
        }
    }
    else {
        var err = "Invalid call to document changestatus. A payload with param DocumentId and DocumentStatusCode must be specified.";
        log.error(err);

        res.missingParameters("DocumentStatusCode, DocumentId");
    }
};