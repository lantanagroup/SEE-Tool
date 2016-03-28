var MongoClient = require('mongodb').MongoClient,
    Server = require("mongodb").Server,
    _ = require("underscore"),
    config = require('../config/default.js').Settings;

exports.create = function (onDatabaseOpen) {
    var routeStore = function () {
        var self = this;

        self.documentToStore = {};

        self.db = new require('mongodb').Db('route', new Server(config.dbHost, config.dbPort, { auto_reconnect: true, safe: true }, {}));

        self.db.open(function (error, client) {
            if (error) {
                console.log(error);
            } else {
                client.authenticate(config.dbUser, config.dbPassword, function(err, success){
                    if(err){
                        console.log('Error authenticating user: ' + err);
                    } else {
                        console.log('route database open');
                        if (onDatabaseOpen) {
                            onDatabaseOpen();
                        }
                    }
                });
            }
        });
    };

    routeStore.prototype.getCollection = function (callback) {
        this.db.collection('route', function (error, document_collection) {
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

    routeStore.prototype.getAll = function (callback) {
        this.getCollection(function (error, document_collection) {
            if (error) {
                callback(error);
            }
            else {
                //document_collection.find({},function (error, result) {
                //    callback(error, result);
                //});
                //callback(error, document_collection.find().toArray());

                document_collection.find({}, function (error, result) {
                    result.toArray(callback);
                });
            }
        });
    };

    routeStore.prototype.create = function (document, callback) {
        this.getCollection(function (error, document_collection) {
            if (error) {
                callback(error);
            }
            else {
                document_collection.insert(document, function (error, result) {
                    callback(error, result);
                });
            }
        });
    };

    routeStore.prototype.deleteAll = function (callback) {
        this.getCollection(function (error, document_collection) {
            if (error) {
                callback(error);
            }
            else {
                console.log("deleting all medication routes");
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

    routeStore.prototype.delete = function (code, callback) {
        this.getCollection(function (error, document_collection) {
            if (error) {
                callback(error);
            }
            else {
                console.log("deleting medication route: " + code);
                document_collection.remove({ Code: code }, function (error, removed) {
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

    /*
    routeStore.prototype.getMedicationByCode = function (code, callback) {
        this.getCollection(function (error, document_collection) {
            if (error) {
                callback(error);
            }
            else {
                document_collection.findOne({ Code: code }, function (error, result) {
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
    */
    

    return new routeStore();
}