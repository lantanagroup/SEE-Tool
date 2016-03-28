/// <reference path="../../lib/external/underscore/underscore.js" />
SEE.namespace("SEE.service.proxy");

SEE.service.proxy.DocumentServiceProxy = function () {
    var self = this, baseUrl = "/see/api";

    var GET = function(url, data, onSuccess, onFail){
        $.get(baseUrl + url, data)
            .done(function (data) {
                if (onSuccess) {
                    onSuccess(data);
                }
            })
            .fail(function(jqXHR, textStatus, errorThrown){
                if (onFail) {
                    onFail(textStatus);
                } else {
                    throw "Error occurred on call to server. " + textStatus + " " + errorThrown;
                }        
            });
    };

    var POST = function(url, data, onSuccess, onFail){
        var options = {};

        if (data != null)
        {
            var payload = '';

            if (data.toJS){
                payload = data.toJS();
            }
            else{
                payload = data;
            }


            options = {
                url: baseUrl + url, 
                type: "POST",
                data: JSON.stringify(payload),
                dataType: "json",
                contentType: "application/json"
            }
        }
        else
        {
            options = {
                url: baseUrl + url, 
                type: "POST",
                dataType: "json"
            }
        }
        
        $.ajax(options)
            .done(function (data) {
                if (onSuccess) {
                    onSuccess(data);
                }
            })
            .fail(function(jqXHR, textStatus, errorThrown){
                if (onFail) {
                    onFail(textStatus, errorThrown, jqXHR.status);
                } else {
                    throw "Error occurred on call to server. " + textStatus + " " + errorThrown;
                }        
            });
    };

    //users/login
    self.Login = function (userId, password, onSuccess, onFail) {
        var obj = { userId: userId, password: password };

        POST("/users/login", obj, onSuccess, function(textStatus, errorText, status){
            if(status == "401")
                bootbox.alert("Login failed for user " + userId, function(){
                    window.close();
                });
            else
                bootbox.alert("Login failed with error: " + textStatus + "\n" + errorText, function(){
                    window.close();
                });
        });
    };

//documents/sections/
    self.RetrieveAndLockSection = function (document, sectionName, overrideLock, onLockGranted, onLockDenied, onFailure) {
            docRequest = { DocumentId: document._id, SectionName: sectionName, OverrideLock: overrideLock };        

        if (_.isUndefined(document._id) || document.DocumentInfo.Status !== SEE.enum.DocumentStatusCode.DRAFT) { //new document, never saved or finalized/sent doc not able to change
            var lock = new SEE.model.dto.SectionLockInfo();
            lock.LockedBy = SEE.session.User;
            lock.LockTime = new Date();
            lock.Lock = document.DocumentInfo.Status !== SEE.enum.DocumentStatusCode.DRAFT ? "on" : "N";
            SEE.session.SetSectionLock(document, sectionName, lock);
            onLockGranted(lock)
        } else {
            POST("/documents/sections", docRequest, function (data) {
                if (data.LockInfo) {
                    SEE.session.SetSectionLock(document, sectionName, data.LockInfo);
                    onLockGranted(data);
                } else {
                    onLockDenied(data);
                }
            }, onFailure);
        }
    };
//documents/sections/releaselock
    self.ReleaseLockedSection = function (document, sectionName, onSuccess, onFailure) {
            lockInfo = SEE.session.GetSectionLock(document, sectionName),
            docRequest = { DocumentId: document._id, SectionName: sectionName, Lock: lockInfo ? lockInfo.Lock : null };

        if (lockInfo && lockInfo.Lock === "N") {
            SEE.session.ClearSectionLock(document, sectionName);
            onSuccess(document[sectionName]);
            return;
        }
        SEE.session.ClearSectionLock(document, sectionName);

        if (!_.isUndefined(document._id) && !_.isNull(docRequest.Lock)) { //new document, never saved
            POST("/documents/sections/releaselock", docRequest, function (data) {
                if (onSuccess) {
                    onSuccess(data);
                }
            }, onFailure);
        } else { //we weren't holding a lock, move on
            onSuccess(document[sectionName]);
        }
    };
//document
    self.RetrieveDocumentList = function (args, onSuccess) {
        var param = null;
        if (!_.isUndefined(args) && !_.isNull(args)) {
            //MRU, Status, id

            param = args;
        }
        GET("/list", param, onSuccess);
    };
//documents?id
    self.RetrieveDocument = function (documentId, onSuccess) {
        var docRequest = { 'id': documentId };

        GET("/documents", docRequest, onSuccess);
    };
//documents
    self.CreateDocument = function (document, onSuccess) {

        POST("/documents", document, function (data) {
            var newDocument;
            if (_.isArray(data.payload) && data.payload.length > 0) {
                newDocument = data.payload[0];
            }
            onSuccess(newDocument);
        });

    };
//documents
    self.UpdateDocument = function (document, onSuccess) {

        POST("/documents", document, function (data) {
            onSuccess(data);
        });
    };


//document/search? or document/
    self.Search = function (query, onSuccess) {

       GET("/search", { query: query }, function (data) {
            var results;
            if (!_.isUndefined(data) && !_.isUndefined(data.results)) {
                results = data.results;
            }
            onSuccess(results);
        });
    };
//documents/send
    self.SendDocument = function (document, onSuccess, onFail) {
        POST("/documents/send", document, onSuccess, onFail);
    };

//problems
    self.SnomedProblemSearch = function (query, onSuccess) {

        GET("/problems", { query: query }, onSuccess);
    };
//medications
    self.MedicationSearch = function (query, onSuccess) {

        GET("/medications", { query: query }, onSuccess);
    };
//medicationroutes
    self.MedicationRouteSearch = function (query, onSuccess) {
        GET("/medicationroutes", null, onSuccess);
    };
//documents/status
    self.UpdateDocumentStatus = function (document, newStatus, onSuccess) {
        var param = { DocumentId: document._id, DocumentStatusCode: newStatus };

        POST("/documents/status", param, function (result) {
            if (onSuccess) {
                onSuccess(result);
            }
        });
    }
//documents/cda
    self.GenerateCdaXml = function (document, onSuccess) {

        var param = { Document: document };

        POST("/documents/cda", param, function (result) {
            if (onSuccess) {
                onSuccess(result);
            }
        });
    };
//documents/sections/transform?sourceDocumentId=;sectionCode=
    self.TransformSection = function (document, importSectionCode, onSuccess) {

        var param = { sourceDocumentId: document._id, sectionCode: importSectionCode };

        POST("/documents/sections/transform", param, onSuccess);
    };
//DELETE documents
    //self.RemoveAllDocuments = function (onSuccess) {
    //    var url = baseUrl + "/list";
    //    var param = { };

    //    return doAJAXCall(param, url, "DELETE", onSuccess);
    //};

//organizations/assigningauthorities?groupIdentifier=
    self.RetrieveAssigningAuthorityList = function (groupIdentifier, onSuccess) {

        var param = { groupIdentifier: groupIdentifier };

        GET("/organizations/assigningauthorities", param, onSuccess);
    }
//documents/sections/
    self.UpdateDocumentSection = function (document, sectionName, onSuccess) {
        var lockInfo = SEE.session.GetSectionLock(document, sectionName);
        var param = {
            documentId: document._id,
            sectionName: sectionName,
            newEvents: document.DocumentInfo.History.NewEvents,
            title: document.DocumentInfo.Title,
            section: document[sectionName],
            lock: lockInfo ? lockInfo.Lock : "999"
        };

        POST("/documents/sections/update", param, function (data) {
            //clear the events
            document.DocumentInfo.History.NewEvents = [];
            onSuccess(data);
        });
    };

//documents/locks?id=
    self.GetAllLocksForDocument = function (document, onSuccess) {
        var param = { id: document._id };

        GET("/documents/locks", param, function (result) {
            if (onSuccess) {
                onSuccess(result);
            }
        });
    };
///organizations?id=
    self.GetOrganizationForUser = function (user, onSuccess) {

        var param = { groupIdentifier: user.GroupIdentifier };

        GET("/organizations", param,
            function (result) {
                if (onSuccess) {
                    onSuccess(result);
                }
            },
            function(error){
                bootbox.alert("Login failed with error: " + error, function(){
                    window.close();
                });
        });
    };

    self.UpdateOrganization = function (organization, onSuccess) {

        var param = { organization: organization };

        POST("/organizations", param, function (result) {
            if (onSuccess) {
                onSuccess(result);
            }
        });
    };

//users
    self.UpdateUser = function (user, onSuccess) {

        var param = {
            user: user
        };

        POST("/users/", param,function (data) {
            if (onSuccess) {
                onSuccess(data);
            }
        });
    };
};