var problem = require("../Model/SnomedProblem.js"),
    MongoClient = require('mongodb').MongoClient,
    Server = require("mongodb").Server,
    _ = require("underscore"),
    config = require('../config/default.js').Settings;

exports.create = function (onDatabaseOpen) {        
    var snomedProblemStore = function () {
        var self = this;

        self.documentToStore = {};

        self.db = new require('mongodb').Db('snomed_problem', new Server(config.dbHost, config.dbPort, { auto_reconnect: true, safe: true }, {}));

        self.db.open(function (error, client) {
            if (error) {
                console.log(error);
            }
            else {
                client.authenticate(config.dbUser, config.dbPassword, function(err, success){
                    if(err){
                        console.log('Error authenticating user: ' + err);
                    } else {
                        console.log('Snomed Problem database open');
                        if (onDatabaseOpen) {
                            onDatabaseOpen();
                        }
                    }
                });
            }
        });
    };

    snomedProblemStore.prototype.getCollection = function (callback) {
        this.db.collection('problem', function (error, document_collection) {
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

    snomedProblemStore.prototype.create = function (problem, callback) {
        this.getCollection(function (error, problem_collection) {
            if (error) {
                callback(error);
            }
            else {                
                problem_collection.insert(problem, function (error, result) {
                    callback(error, result);
                });
            }
        });
    };

    snomedProblemStore.prototype.delete = function (problem_SNOMED_CID, callback) {
        this.getCollection(function (error, problem_collection) {
            if (error) {
                callback(error);
            }
            else {
                problem_collection.remove({ SNOMED_CID: problem_SNOMED_CID }, function (error, removed) {
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

    snomedProblemStore.prototype.getUserBySNOMED_CID = function (SNOMED_CID, callback) {
        this.getCollection(function (error, problem_collection) {
            if (error) {
                callback(error);
            }
            else {
                problem_collection.findOne({ SNOMED_CID: SNOMED_CID }, function (error, result) {
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

    snomedProblemStore.prototype.RunRegExSearch = function (regex, callback) {
        this.getCollection(function (error, problem_collection) {
            var filterObj = { 'SNOMED_FSN': { $regex: regex, $options: 'i' } }
                , projection = { 'SNOMED_CID': 1, 'SNOMED_FSN': 1, '_id': 1 };

            if (error) {
                callback(error);
            }
            else {
                var problemList = [];
                var stream = problem_collection.find(filterObj, projection).stream();
                stream.on("data", function (item) {
                    problemList.push(item);
                });
                stream.on("end", function () {
                    callback(error, problemList);
                });
            }
        });
    };

    snomedProblemStore.prototype.RankedSearch = function (text, callback) {
        var documentList = [], semaphore = 1;
        this.RunRegExSearch('^' + text, function (error, results) {
            documentList = documentList.concat(results);
            semaphore--;
            if (!semaphore) {
                callback(error, documentList);
            }
        });
    };

    snomedProblemStore.prototype.close = function(){
        this.db.close();
    };

    return new snomedProblemStore();
}