

exports.post = function (data, dataStores, req, res, log) {
    var section, response, documentStore = dataStores.DocumentStore;

    if (!data.SectionName || !data.DocumentId) {
        res.missingParameters("SectionName, DocumentId");
        return;
    }

    sectionName = data.SectionName;
    documentId = data.DocumentId;
    overrideLock = data.OverrideLock || false;

    //lookup and return the document

    documentStore.RetrieveAndLockSection(documentId, sectionName, req.session.user, overrideLock, function (error, section, lockInfo) {
        if (error) {
            log.error("error on document section retrieve: ", error);

            //send unsuccessful response
            res.sendError("There was an error retrieving the section.");
        } else {
            log.info("document section retrieve and lock returned success");
            if (section && lockInfo) {
                log.info("Lock acquired");
                //send successful response
                //lock granted, record into log
                documentStore.createLockInfoLogEntry(documentId, sectionName, lockInfo, function (error, result) {
                    res.send( {Section: section, LockInfo: lockInfo });
                });
            } else {
                log.info("Lock denied");
                documentStore.findCurrentLockInfoForSection(req.session.user, documentId, sectionName, function (error, lockInfo) {
                    if (error) {
                        log.error("error on find current lock info for section: ", error);

                        //send successful response
                        res.sendError("An exclusive lock on the document could not be obtained because of an error.");
                    } else {
                        if (lockInfo) {
                            res.send({ Locked: true, LockedBy: lockInfo.LockedBy, LockTime: lockInfo.LockTime });
                        }
                        else {
                            res.send({ Locked: true, LockedBy: { FirstName: "Another", LastName: "User" }, LockTime: new Date()});
                        }
                    }
                });
            } 
        }
    });
};