var document = require("../Model/Document.js"),
    DocumentStatusCode = require("../Model/Enum/enum.js").DocumentStatusCode,
    sectionLockInfoCreator = require("../Model/SectionLockInfo.js"),
    DocumentSectionToSectionCodeMap = require('../CDA/Constants.js').CONSTANTS.MAP.DocumentSectionToSectionCode,
    HistoryEventCreator = require("../Model/HistoryEvent.js").create,
    EventDirectionCode = require("../Model/Enum/enum.js").EventDirectionCode,
    MongoClient = require('mongodb').MongoClient,
    ObjectID = require('mongodb').ObjectID,
    Server = require("mongodb").Server,
    _ = require("underscore"),
    uuid = require("../utils/uuid.js"),
    config = require('../config/default.js').Settings;

exports.create = function (onDatabaseOpen) {
    var documentStore = function () {
        var self = this;

        self.documentToStore = {};

        self.db = new require('mongodb').Db('cda', new Server(config.dbHost, config.dbPort, { auto_reconnect: true, safe: true }, {}));
        
        self.db.open(function (error, client) {
            if (error) {
                console.log(error);
            }
            else {
                client.authenticate(config.dbUser, config.dbPassword, function(err, success){
                    if(err){
                        console.log(err);
                    } else {
                        console.log('document database open');
                        if (onDatabaseOpen) {
                            onDatabaseOpen();
                        }
                    }
                });
            }
        });
    };

    documentStore.prototype.newDocument = function() {
        return document.create();
    }

    documentStore.prototype.getDocumentById = function (user, id, callback) {
        this.getCollection(function (error, document_collection) {
            if (error) {
                callback(error);
            }
            else {
                console.log("Id -> " + id);
                document_collection.findOne({
                    'DocumentInfo.GroupIdentifier': user.GroupIdentifier,
                    _id: document_collection.db.bson_serializer.ObjectID.createFromHexString(id)
                }, function (error, result) {
                    if (error) {
                        callback(error);
                    }
                    else {
                        callback(null, result);
                    }
                });
            }
       });
    };

    documentStore.prototype.getDocumentByCDAId = function (extension, root, user, callback) {
        this.getCollection(function (error, document_collection) {
            if (error) {
                callback(error);
            }
            else {
                document_collection.findOne({
                    'DocumentInfo.GroupIdentifier': user.GroupIdentifier,
                    'DocumentInfo.OtherDocumentIdentificationMetadata.Root': root,
                    'DocumentInfo.OtherDocumentIdentificationMetadata.Extension': extension
                }, function (error, result) {
                    if (error) {
                        callback(error);
                    }
                    else {
                        callback(null, result);
                    }
                });
            }
       });
    };

    documentStore.prototype.getCollection = function (callback) {
        this.db.collection('document', function (error, document_collection) {
            if (error) {
                console.log("++++++++++++++  ERROR!!! ++++++++++++++++++");
                console.log("Error on getting collection");
                console.log(error);
                console.log("+++++++++++++++++++++++++++++++++++++++++++");
                callback(error);
            }
            else
            {
                callback(null, document_collection);
            }
        });
    };

    documentStore.prototype.getLockCollection = function (callback) {
        this.db.collection('lock', function (error, lock_collection) {
            if (error) {
                console.log("++++++++++++++  ERROR!!! ++++++++++++++++++");
                console.log("Error on getting collection");
                console.log(error);
                console.log("+++++++++++++++++++++++++++++++++++++++++++");
                callback(error);
            }
            else {
                callback(null, lock_collection);
            }
        });
    };

    documentStore.prototype.getDocumentList = function (user, filterArg, callback) {
        this.getCollection(function (error, document_collection) {
            //always filter by user's group id
            var filterObj = { 'DocumentInfo.GroupIdentifier': user.GroupIdentifier },
                projection = { 'DocumentInfo': 1, '_id': 1 };
            console.log("Filter Arg => ");
            console.log(filterArg);
            //build filter obj from arguments
            if (filterArg && !_.isUndefined(filterArg.Status)) {
                //get by status
                filterObj["DocumentInfo.Status"] = filterArg.Status;

            } else if (filterArg && !_.isUndefined(filterArg.MRU)) {
                //get by mru list
                var oidList = [];
                _.each(user.MRU, function (mru) {
                    oidList.push(document_collection.db.bson_serializer.ObjectID.createFromHexString(mru));
                });
                filterObj["_id"] = { $in: oidList };
            } else if (filterArg && !_.isUndefined(filterArg.Id)) {
                filterObj["_id"] = document_collection.db.bson_serializer.ObjectID.createFromHexString(filterArg.Id);
            }

            console.log("Filter Obj => ");
            console.log(filterObj);

            if (error) {
                callback(error);
            }
            else {
                var documentList = [];
                var stream = document_collection.find(filterObj, projection).stream();
                stream.on("data", function (item) {
                    console.log("stream data -> " + item._id);
                    item.DocumentInfo.id = item._id;
                    documentList.push(item.DocumentInfo);
                });
                stream.on("end", function () {
                    console.log("stream finished: " + documentList.length.toString() + " records");
                    callback(error, documentList);
                });
            }
        });
    };

    documentStore.prototype.RunRegExSearch = function (user, regex, callback) {
        this.getCollection(function (error, document_collection) {
            console.log("SearchByRegex called with '" + regex + "' by " + user.UserName + "...");
            var filterObj = {
                'DocumentInfo.GroupIdentifier': user.GroupIdentifier,
                $or: [
                    { 'DocumentInfo.Patient.PersonInfo.FirstName': { $regex: regex, $options: 'i' } },
                    { 'DocumentInfo.Patient.PersonInfo.LastName': { $regex: regex, $options: 'i' } },
                    { 'DocumentInfo.Title': { $regex: regex, $options: 'i' } },
                    { 'DocumentInfo.Author': { $regex: regex, $options: 'i' } }
                ]
            }, projection = { 'DocumentInfo': 1, '_id': 1 };

            console.log("filterObj=>");
            console.log(filterObj);

            if (error) {
                callback(error);
            }
            else {
                var documentList = [];
                var stream = document_collection.find(filterObj, projection).stream();
                stream.on("data", function (item) {
                    console.log("stream data -> " + item._id);
                    item.DocumentInfo.id = item._id;
                    item.SortValue = 1;
                    documentList.push(item.DocumentInfo);
                });
                stream.on("end", function () {
                    console.log("stream finished: " + documentList.length.toString() + " records");
                    callback(error, documentList);
                });
            }
        });
    };

    documentStore.prototype.RankedSearch = function (user, text, callback) {
        var documentList = [], semaphore = 2;
        this.RunRegExSearch(user, '(?=(?!^' + text + '))' + text, function (error, results) {
            documentList = documentList.concat(results);
            semaphore--;
            if (!semaphore) {
                callback(error, documentList);
            }
        });
        this.RunRegExSearch(user, '^' + text, function (error, results) {
            documentList = documentList.concat(results);
            semaphore--;
            if (!semaphore) {
                callback(error, documentList);
            }
        });
    };

    documentStore.prototype.create = function (document, callback) {

        this.getCollection(function(error, document_collection) {
            if (error) {
                callback(error);
            }
            else {
                document.DocumentInfo.History.HistoricalEvents = [];
                _.each(document.DocumentInfo.History.NewEvents, function (ev) {
                    document.DocumentInfo.History.HistoricalEvents.push(ev);
                });
                document.DocumentInfo.History.NewEvents = [];

                document_collection.insert(document, {safe:true}, function (error, result) {
                    callback(error, result);
                });
            }
        });
    };

    documentStore.prototype.changeStatus = function (documentId, documentStatusCode, callback) {
        if (documentStatusCode !== DocumentStatusCode.DRAFT) {
            callback("Invalid status code change. Cannot change status to Draft");
        }

        this.getCollection(function (error, document_collection) {
            if (error) {
                callback(error);
            }
            else {
                var id = document_collection.db.bson_serializer.ObjectID.createFromHexString(documentId);
                document_collection.update({ _id: id }, {
                    $set: {
                        'DocumentInfo.Status': documentStatusCode,
                    }
                }, { safe: true }, function (error, result) {
                    if (error) {
                        console.log("++++++++++++++++++++++");
                        console.log("| ERROR on changeStatus!!! |");
                        console.log("++++++++++++++++++++++");
                        console.log(error);
                    }
                    callback(error, result);
                });
            }
        });
    };

    documentStore.prototype.removeAll = function (callback) {
        this.getCollection(function (error, document_collection) {
            if (error) {
                callback(error);
            }
            else {
                document_collection.remove();
                if (callback) {
                    callback();
                }
            };
        })
    };

    documentStore.prototype.updateSection = function (documentId, sectionName, section, lock, newEvents, callback) {
        this.getCollection(function (error, document_collection) {
            if (error) {
                callback(error);
            }
            else {
                var id = document_collection.db.bson_serializer.ObjectID.createFromHexString(documentId);
                var queryObj = {
                    _id: id,
                    "DocumentInfo.Status": DocumentStatusCode.DRAFT                    
                };
                var updateObj = JSON.parse('{"' + sectionName + '":' + '""}');
                if (sectionName === 'DocumentInfo') {
                    queryObj['DocumentInfo.Header.Lock'] = lock;                    
                } else {
                    queryObj[sectionName + '.Lock'] = lock;
                }
                queryObj['DocumentInfo.Status'] = DocumentStatusCode.DRAFT; //make sure we are in draft state
                updateObj[sectionName] = section;
                document_collection.update(
                    queryObj,
                    {
                        $set: updateObj
                    },
                    {
                        safe: true
                    },
                    function (error, result) {
                        if (error) {
                            console.log("+++++++++++++++++++++++++++++++");
                            console.log("| ERROR on Update Section!!!  |");
                            console.log("+++++++++++++++++++++++++++++++");
                            console.log(error);
                            callback(error, 0);
                        } else {
                            document_collection.update(
                                               queryObj,
                                               {
                                                   $push: { "DocumentInfo.History.HistoricalEvents": newEvents }
                                               },
                                               {
                                                   safe: true
                                               }, function (error, result) {
                                                   callback(error, result);
                                               });
                        }
                    });
            }
        });
    };

    documentStore.prototype.ReleaseLockedSection = function (documentId, sectionName, lock, user, callback) {
        this.getCollection(function (error, document_collection) {
            if (error) {
                callback(error);
            } else {
                //attempt update of section with no lock
                var id = new ObjectID.createFromHexString(documentId);
                var updateObj = JSON.parse('{"' + sectionName + '.Lock":' + '"-1"}');
                //updateObj[sectionName + ".LockedBy"] = {};
                //updateObj[sectionName + "LockedTime"] = new Date();
                var queryObj = {
                    _id: id,
                    'DocumentInfo.Status': DocumentStatusCode.DRAFT
                };
                if (sectionName === 'DocumentInfo') {
                    queryObj['DocumentInfo.Header.Lock'] = lock;
                } else {
                    queryObj[sectionName + '.Lock'] = lock;
                }
                try {
                    document_collection.findAndModify(
                        queryObj,
                        {},
                        {
                            $set: updateObj
                        },
                        {
                            new: true
                        },
                        function (err, object) {
                            if (err) {
                                console.log(err);
                                console.log("section not locked, error occurred");
                                callback(err, null, null);
                                console.log("-----------------------------------");
                            } else {
                                if (object && object[sectionName]) {
                                    console.log("Section " + sectionName + " unlocked.");                                
                                } else {
                                    console.log("No document returned! Section lock might have been overridden");
                                }
                                console.log("find and update returned success");
                                console.log("-----------------------------------");
                                callback(null, object, lock);
                            }
                        });
                } catch (err) {
                    callback(err, object, lock);
                }
            }
        });
    };

    documentStore.prototype.RetrieveAndLockSection = function (documentId, sectionName, user, overrideLock, callback) {
        this.getCollection(function (error, document_collection) {
            if (error) {
                callback(error);
            } else {
                //generate guid
                var lock = uuid.v4();
                var lockInfo = sectionLockInfoCreator.create();
                lockInfo.LockedBy = { UserName: user.UserName, FirstName: user.PersonInfo.FirstName, LastName: user.PersonInfo.LastName };
                lockInfo.LockTime = new Date();
                lockInfo.Lock = lock;

                var id = new ObjectID.createFromHexString(documentId);
                var queryObj = {
                    _id: id,
                    'DocumentInfo.Status': DocumentStatusCode.DRAFT
                };
                var updateObj = JSON.parse('{"' + sectionName + '.Lock":' + '"' + lock + '"}');
                updateObj[sectionName + ".LockedBy"] = lockInfo.LockedBy;
                updateObj[sectionName + ".LockTime"] = lockInfo.LockTime;
                if (!overrideLock) { //don't override, so we look for no lock
                    queryObj['$and'] = [{ $or: [] }];
                    queryObj['$and'][0]['$or'].push(JSON.parse('{"' + sectionName + '.Lock":"-1"}'));
                    queryObj['$and'][0]['$or'].push(JSON.parse('{"' + sectionName + '.LockedBy.UserName":"' + lockInfo.LockedBy.UserName + '"}'));
                }
                try {
                    document_collection.findAndModify(
                        queryObj,
                        {},
                        {
                            $set: updateObj
                        },
                        { new: true},
                        function (err, object) {
                            if (err) {
                                console.log(err);
                                console.log("section not locked, error occurred");
                                callback(err, null, null);
                            } else {
                                console.log(sectionName);
                                if (object && sectionName === 'DocumentInfo.Header') {
                                    object = object['DocumentInfo'];
                                    sectionName = 'Header';
                                }
                                if (object && object[sectionName]) {
                                    console.log("Lock acquired: " + object[sectionName].Lock);
                                    callback(null, object[sectionName], lockInfo);
                                } else {                                    
                                    callback();
                                }
                            }
                        });
                } catch (err) {
                    callback(err, null, null);
                }
            }
        });
    };


    documentStore.prototype.update = function (document, callback) {
        this.getCollection(function (error, document_collection) {
            if (error) {
                callback(error);
            }
            else {
                var id = document_collection.db.bson_serializer.ObjectID.createFromHexString(document._id);
                document_collection.update({ _id: id }, {
                    $set: {
                        CdaXmlDocument: document.CdaXmlDocument,
                        DocumentInfo: document.DocumentInfo,
                        ProblemSection: document.ProblemSection,
                        VitalSection: document.VitalSection,
                        MedicationSection: document.MedicationSection,
                        FunctionalStatusSection: document.FunctionalStatusSection,
                        AdvanceDirectivesSection: document.AdvanceDirectivesSection,
                        AllergySection: document.AllergySection,
                        AssessmentSection: document.AssessmentSection,
                        ChiefComplaintSection: document.ChiefComplaintSection,
                        EncounterSection: document.EncounterSection,
                        FamilyHistorySection: document.FamilyHistorySection,
                        HistoryOfPresentIllnessSection: document.HistoryOfPresentIllnessSection,
                        HistoryOfPastIllnessSection: document.HistoryOfPastIllnessSection,
                        HospitalDischargeDiagnosisSection: document.HospitalDischargeDiagnosisSection,
                        ImmunizationSection: document.ImmunizationSection,
                        MedicalEquipmentSection: document.MedicalEquipmentSection,
                        PayerSection: document.PayerSection,
                        PlanOfCareSection: document.PlanOfCareSection,
                        ProceduresSection: document.ProceduresSection,
                        ResultsSection: document.ResultsSection,
                        SocialHistorySection: document.SocialHistorySection
                    }
                }, { safe: true }, function (error, result) {
                    if (error) {
                        console.log("++++++++++++++++++++++");
                        console.log("| ERROR on Update!!! |");
                        console.log("++++++++++++++++++++++");
                        console.log(error);
                    }
                    callback(error, result);
                });
            }
        });
    };

    documentStore.prototype.createLockInfoLogEntry = function (documentId, sectionName, lockInfo, callback) {
        this.getLockCollection(function (error, lock_collection) {
            if (error) {
                callback(error);
            } else {
                lock_collection.insert({
                    DocumentId: documentId,
                    SectionName: sectionName,
                    LockInfo: lockInfo
                }, function (error, result) {
                    callback(error, result);
                });
            }
        });
    };

    documentStore.prototype.findCurrentLockInfoForSection = function (user, documentId, sectionName, callback) {
        this.getDocumentById(user, documentId, function (error, document) {
            if (error) {
                callback(error, null);
            } else {                
                if (sectionName === 'DocumentInfo.Header' || sectionName === 'DocumentInfo' || document[sectionName]) {
                    var lockInfo = sectionLockInfoCreator.create();
                    if (sectionName === 'DocumentInfo.Header' || sectionName === 'DocumentInfo') {
                        lockInfo.LockedBy = document['DocumentInfo']['Header'].LockedBy;
                        lockInfo.LockTime = document['DocumentInfo']['Header'].LockTime;
                        lockInfo.Lock = document['DocumentInfo']['Header'].Lock;
                    } else {
                        lockInfo.LockedBy = document[sectionName].LockedBy;
                        lockInfo.LockTime = document[sectionName].LockTime;
                        lockInfo.Lock = document[sectionName].Lock;
                    }
                    callback(null, lockInfo);
                } else {
                    var lockInfo = sectionLockInfoCreator.create();
                    lockInfo.LockedBy = { UserName: "Another User", FirstName: "Another", LastName: "User" };
                    lockInfo.LockTime = new Date();
                    lockInfo.Lock = "999";
                    callback(null, lockInfo);
                }
            }
        });
    };

    documentStore.prototype.findAllLocksForDocument = function (user, documentId, callback) {
        this.getDocumentById(user, documentId, function (error, document) {
            if (error) {
                callback(error);
            } else {
                var locks = [];
                for (p in document) {
                    if (document[p] && document[p].Lock && document[p].Lock !== "-1" && document[p].LockTime && document[p].LockedBy) {
                        var mapEntry = DocumentSectionToSectionCodeMap.findSection("DocumentPropertyName", p);
                        var title = document[p].Title;
                        if (!title && mapEntry) {
                            title = mapEntry.Title;
                        }
                        locks.push({ SectionTitle: title, LockedBy: document[p].LockedBy, LockTime: document[p].LockTime });
                    }
                }

                if (document && document.DocumentInfo && document.DocumentInfo.Header) {
                    var header = document.DocumentInfo.Header;
                    if (header.Lock && header.Lock !== "-1") {
                        locks.push({ SectionTitle: "DEMOGRAPHICS", LockedBy: header.LockedBy, LockTime: header.LockTime });
                    }
                }
                callback(null, locks);
            }
        });
    };


    documentStore.prototype.recordSourceDocumentEvent = function (user, sourceDocumentId, targetDocumentId, targetDocumentTitle, callback) { //source document is the document that was used as a source for a section import
        this.getCollection(function (error, document_collection) {
            if (error) {
                callback(error);
            } else {
                var id = document_collection.db.bson_serializer.ObjectID.createFromHexString(sourceDocumentId); 
                var event = HistoryEventCreator();
                event.Author = user;
                event.Event = 'Export';
                event.SectionName = '';
                event.SourceDocumentId = sourceDocumentId;
                event.TargetDocumentId = targetDocumentId;
                event.TargetDocumentTitle = targetDocumentTitle;
                event.EventDirection = EventDirectionCode.OUT;                

                document_collection.update({ _id: id }, {
                    $push: { "DocumentInfo.History.HistoricalEvents": event }
                }, { safe: true }, function (error, result) {
                    if (error) {
                        console.log("++++++++++++++++++++++");
                        console.log("| ERROR on Update!!! |");
                        console.log("++++++++++++++++++++++");
                        console.log(error);
                    }
                    callback(error, result);
                });
            }
        });
    };

    return new documentStore();
};