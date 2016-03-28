var _ = require('underscore'),
    EventDirectionCode = require("../../../../Model/Enum/enum.js").EventDirectionCode;


exports.post = function (data, dataStores, req, res, log) {
    var section, response, documentStore = dataStores.DocumentStore, sectionName, documentId, lock, newEvents, title;

    if (!data.section || !data.documentId || !data.sectionName || !data.lock) {
        response = "Invalid call to document section update, the payload must contain section, documentId, and sectionName.";
        log.error(response);
        res.missingParameters("section, sectionName, documentId, lock");
        return;
    }
    section = data.section;
    sectionName = data.sectionName;
    documentId = data.documentId;
    lock = data.lock;
    newEvents = data.newEvents;
    title = data.title;

    section.Lock = lock;
    //lookup and return the document
    documentStore.updateSection(documentId, sectionName, section, lock, newEvents, function (error, numRecsAffected) {
        if (error) {
            log.error("error on document section update: ", error);

            //send error response
            res.sendError("There was an error updating the section.");
        } else {
            if (numRecsAffected < 1) {
                documentStore.findCurrentLockInfoForSection(req.session.user, documentId, sectionName, function (error, lockInfo) {
                    if (error) {
                        log.error("error on find current lock info for section: ", error);

                        //send successful response
                        res.sendError("There was an error finding a lock for this section.");
                    } else {
                        if (lockInfo) {
                            res.send({ NumberRecordsUpdated: numRecsAffected, Locked: true, LockedBy: lockInfo.LockedBy, LockTime: lockInfo.LockTime } );
                        }
                        else {
                            res.send({ NumberRecordsUpdated: numRecsAffected, Locked: true, LockedBy: { FirstName: "Another", LastName: "User" }, LockTime: new Date() } );
                        }
                    }
                });                    
            } else {
                log.info("document section updated successfully");
                if (newEvents && newEvents.length > 0) {
                    var importEvent = _.find(newEvents, function (e) {
                        return e.EventDirection === EventDirectionCode.IN;
                    });
                    log.info(importEvent);
                    //imported from another document, put that into source document's history
                    if (importEvent) {
                        documentStore.recordSourceDocumentEvent(req.session.user, importEvent.SourceDocumentId, documentId, title, function (error) {
                            if (error) {
                                //send error response, history failed to save
                                res.sendError("There was an error updating the document.");
                            } else {
                                //send successful response
                                res.send({NumberRecordsUpdated: numRecsAffected });
                            }
                        });
                    } else {
                        //send successful response
                        res.send({NumberRecordsUpdated: numRecsAffected });
                    }
                }

                //send successful response
                res.send({NumberRecordsUpdated: numRecsAffected });
            }
        }
    });
};