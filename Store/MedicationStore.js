var MongoClient = require('mongodb').MongoClient,
    Server = require("mongodb").Server,
    _ = require("underscore"),
    config = require('../config/default.js').Settings;

exports.create = function (onDatabaseOpen) {
    var medicationStore = function () {
        var self = this;

        self.documentToStore = {};

        self.db = new require('mongodb').Db('medication', new Server(config.dbHost, config.dbPort, { auto_reconnect: true, safe: true, w:1 }, {}));

        self.db.open(function (error, client) {
            if (error) {
                console.log(error);
            } else {
                client.authenticate(config.dbUser, config.dbPassword, function(err, success){
                    if(err){
                        console.log('Error authenticating user: ' + err);
                    } else {
                        console.log('medication database open');
                        if (onDatabaseOpen) {
                            onDatabaseOpen(self);
                        }
                    }
                });
            }
        });
    };

    medicationStore.prototype.getCollection = function (callback) {
        this.db.collection('medication', function (error, document_collection) {
            if (error) {
                console.log("++++++++++++++  ERROR!!! ++++++++++++++++++");
                console.log("Error on getting collection");
                console.log(error);
                console.log("+++++++++++++++++++++++++++++++++++++++++++");
                callback(error);
            }
            else {
                callback(null, document_collection);
            }
        });
    };

    medicationStore.prototype.create = function (document, callback) {
        this.getCollection(function (error, document_collection) {
            if (error) {
                if (callback) {
                    callback(error);
                } else {
                    console.log(error);
                }
            }
            else {
                document_collection.insert(document, { safe: true }, function (error, result) {
                    if (callback) {
                        callback(error, result);
                    } else {
                        if (error) {
                            console.log(error);
                        }
                    }
                });
            }
        });
    };

    medicationStore.prototype.deleteAll = function (callback) {
        this.getCollection(function (error, document_collection) {
            if (error) {
                callback(error);
            }
            else {
                document_collection.remove({}, function (error, removed) {
                    if (error) {
                        console.log("++++++++++++++++++++++");
                        console.log("| ERROR on Remove!!! |");
                        console.log("++++++++++++++++++++++");
                        console.log(error);
                    }
                    if (callback) {
                        callback(error, removed);
                    }
                });
            }
        });
    };

    medicationStore.prototype.delete = function (cuid, callback) {
        this.getCollection(function (error, document_collection) {
            if (error) {
                callback(error);
            }
            else {
                document_collection.remove({ Cuid: cuid }, function (error, removed) {
                    if (error) {
                        console.log("++++++++++++++++++++++");
                        console.log("| ERROR on Remove!!! |");
                        console.log("++++++++++++++++++++++");
                        console.log(error);
                    }
                    if (callback) {
                        callback(error, removed);
                    }
                });
            }
        });
    };

    medicationStore.prototype.getMedicationByCUID = function (cuid, callback) {
        this.getCollection(function (error, document_collection) {
            if (error) {
                callback(error);
            }
            else {
                document_collection.findOne({ Cuid: cuid }, function (error, result) {
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

    medicationStore.prototype.RunRegExSearch = function (regex, callback) {
        this.getCollection(function (error, document_collection) {
            var filterObj = { 'Name': { $regex: regex, $options: 'i' } };

            if (error) {
                callback(error);
            }
            else {
                var documentList = [];
                var stream = document_collection.find(filterObj).stream();
                stream.on("data", function (item) {
                    //console.log("stream data -> " + item._id);
                    documentList.push(item);
                });
                stream.on("end", function () {
                    //console.log("stream finished: " + documentList.length.toString() + " records");
                    callback(error, documentList);
                });
            }
        });
    };

    medicationStore.prototype.RankedSearch = function (text, callback) {
        //var semaphore = 1;

        this.getCollection(function (error, document_collection) {

            if (error) {
                callback(error);
            }
            else {
                document_collection.find({ 'Name': { $regex: '\\b' + text, $options: 'i' } }).limit(20).toArray(callback);
            }
        });
/*

        this.RunRegExSearch('\\b' + text, function (error, results) {
            var documentList = [];
            documentList.concat(results);
            semaphore--;            
            if (!semaphore) {
                //console.log("Exiting");
                callback(error, documentList);
            }
        });
*/
    };

    return new medicationStore();
}