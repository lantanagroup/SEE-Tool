

exports.get = function (data, dataStores, req, res, log) {
    var documentId, documentStore = dataStores.DocumentStore, userStore = dataStores.UserStore;

    if (data.id) {
        documentId = data.id;
    }
    else{
        res.missingParameters("id");
    }


    //lookup and return the document
    documentStore.getDocumentById(req.session.user, documentId, function (error, document) {
        if (error) {
            log.error("Error on document:", error);

            res.sendError("There was an error retrieving the document.");
        }
        else {
            log.info("Document retreived, sending to client.");
            if(document != null){
                userStore.addDocumentToMRUForUser(req.session.user, document._id, function (error, result) {
                    res.send(document);
                });
            }
        }
    });
};

//create
exports.post = function (data, dataStores, req, res, log) {
    var document = data;

    if (document._id)
    {
        update(document, dataStores.DocumentStore, res, log);
    }
    else
    {
        create(document, dataStores.DocumentStore, req.session.user, res, log);
    }
};

exports.put = function (data, dataStores, req, res, log) {
    update(data, dataStores.DocumentStore, res, log);
};

var create = function(document, documentStore, user, res, log){
    var _ = require('underscore'),
    sectionMap = require('../../CDA/Constants.js').CONSTANTS.MAP.DocumentSectionToSectionCode,
    EventDirectionCode = require("../../Model/Enum/enum.js").EventDirectionCode;

    //make sure the author is set
    document.DocumentInfo.Author = user.UserName;
    //set the group to be the author's group
    document.DocumentInfo.GroupIdentifier =user.GroupIdentifier;
    //document.DocumentInfo.Mailbox =user.Mailbox;

    _.each(sectionMap, function (entry) {
        if (document[entry.DocumentPropertyName]) {
            document[entry.DocumentPropertyName].Lock = "-1"; //clean lock
        }
        document["DocumentInfo"]["Header"].Lock = "-1";            
    });

    //lookup and return the document
    documentStore.create(document, function (error, result) {
        if (error) {
            log.error("Error on creating document: " + error);
            //send successful response
            res.sendError("There was an error creating the document.");
        }
        else {                
            var importEvent = _.find(document.DocumentInfo.History.HistoricalEvents, function (e) {
                return e.EventDirection === EventDirectionCode.IN;
            });              
            //imported from another document, put that into source document's history
            if (importEvent) {
                documentStore.recordSourceDocumentEvent(user, importEvent.SourceDocumentId, result[0]._id.toString(), result[0].DocumentInfo.Title, function (error) {
                    if (error) {
                        //send successful response
                        res.send({ payload: result, historyerror: error });
                    } else {
                        //send successful response
                        res.send({ payload: result });
                    }
                });
            } else {
                //send successful response
                res.send({ payload: result });
            }
        }
    });
};

var update = function(document, documentStore, res, log){

    log.info("updating document");
    //lookup and return the document
    documentStore.update(document, function (error) {
        if (error) {
            log.error("error on document update: ", error);

            //send unsuccessful response
            res.sendError("There was an error updating the document.");
        } else {
            log.info("document updated successfully");
            //send successful response
            res.send({});
        }
    });
};