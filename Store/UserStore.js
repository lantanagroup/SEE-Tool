var user = require("../Model/User.js"),
    MongoClient = require('mongodb').MongoClient,
    Server = require("mongodb").Server,
    _ = require("underscore"),
    config = require('../config/default.js').Settings;

exports.create = function (onDatabaseOpen) {
    var userStore = function () {
        var self = this;

        self.documentToStore = {};

        self.db = new require('mongodb').Db('cda_user', new Server(config.dbHost, config.dbPort, { auto_reconnect: true, safe: true }, {}));

        self.db.open(function (error, client) {
            if (error) {
                console.log(error);
            } else {
                client.authenticate(config.dbUser, config.dbPassword, function(err, success){
                    if(err){
                        console.log('Error authenticating user: ' + err);
                    } else {
                        console.log('user database open');
                        if (onDatabaseOpen) {
                            onDatabaseOpen();
                        }
                    }
                });
            }
        });
    };

    userStore.prototype.removeUser = function (userName, callback) {
        this.getUserCollection(function (error, user_collection) {
            if (error) {
                callback(error);
            }
            else {
                user_collection.remove({ UserName: userName }, { w: 1 }, callback);
            }
        })
    };

    userStore.prototype.getUserById = function (id, callback) {
        this.getUserCollection(function (error, user_collection) {
            if (error) {
                callback(error);
            }
            else {
                var bid = user_collection.db.bson_serializer.ObjectID.createFromHexString(id);
                user_collection.findOne({ _id: bid }, function (error, result) {
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

    userStore.prototype.getUserByUserName = function (userName, callback) {
        this.getUserCollection(function (error, user_collection) {
            if (error) {
                callback(error);
            }
            else {
                user_collection.findOne({ UserName: userName }, function (error, result) {
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

    userStore.prototype.addDocumentToMRUForUser = function (user, documentId, callback) {
        this.getUserCollection(function (error, user_collection) {
            if (error) {
                callback(error);
            }
            else {
                console.log("before findOne");
                console.log(user);
                user_collection.findOne({ UserName: user.UserName }, function (error, result) {
                    if (error) {
                        callback(error);
                    }
                    else {                        
                        result.MRU.push(documentId);
                        while (result.MRU.length > 5) {
                            result.MRU.shift();
                        }
                        user_collection.update({ _id: result._id}, { $set: { MRU: result.MRU } }, { safe: true }, function (error, result) {
                            console.log(result);
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
            }
        });
    };

    userStore.prototype.createUser = function (userObj, callback) {
        this.getUserCollection(function (error, user_collection) {
            if (error) {
                callback(error);
            }
            else {
                console.log("inserting user");
                user_collection.insert(userObj, function () {
                    callback(null, userObj);
                });
            }
        });
    };

    userStore.prototype.getUserCollection = function (callback) {
        this.db.collection('user', function (error, user_collection) {
            if (error) {
                console.log("++++++++++++++  ERROR!!! ++++++++++++++++++");
                console.log("Error on getting collection -> user");
                console.log(error);
                console.log("+++++++++++++++++++++++++++++++++++++++++++");
                callback(error);
            }
            else {
                callback(null, user_collection);
            }
        });
    };

    userStore.prototype.updateUser = function (user, callback) {
        this.getUserCollection(function (error, user_collection) {
            if (error) {
                callback(error);
            }
            else {

                var id = null;

                if (typeof user._id == 'string' || user._id instanceof String)
                    id = user_collection.db.bson_serializer.ObjectID.createFromHexString(user._id);
                else
                    id = user._id;

                //var id = user_collection.db.bson_serializer.ObjectID.createFromHexString(user._id);
                console.log("updating user: " + id);
                user_collection.update({ _id: id }, { $set: { PersonInfo: user.PersonInfo} }, { safe: true }, function (error, result) {
                //user_collection.update({ _id: id }, user, function (error, result) {
                    console.log(result);
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

    userStore.prototype.updateUserSecurity = function (user, callback) {
        this.getUserCollection(function (error, user_collection) {
            if (error) {
                callback(error);
            }
            else {

                var id = null;

                if (typeof user._id == 'string' || user._id instanceof String)
                    id = user_collection.db.bson_serializer.ObjectID.createFromHexString(user._id);
                else
                    id = user._id;

                //var id = user_collection.db.bson_serializer.ObjectID.createFromHexString(user._id);
                console.log("updating user: " + id);
                user_collection.update({ _id: id }, { $set: { csrfToken: user.csrfToken , Mailbox: user.Mailbox} }, { safe: true }, function (error, result) {
                    //user_collection.update({ _id: id }, user, function (error, result) {
                    console.log(result);
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

    userStore.prototype.getAssigningAuthorityListCollection = function (callback) {
        this.db.collection('AssigningAuthorityList', function (error, collection) {
            if (error) {
                console.log("++++++++++++++  ERROR!!! ++++++++++++++++++");
                console.log("Error on getting collection -> AssigningAuthorityList");
                console.log(error);
                console.log("+++++++++++++++++++++++++++++++++++++++++++");
                callback(error);
            }
            else {
                callback(null, collection);
            }
        });
    };

    userStore.prototype.retrieveAssigningAuthorityList = function (GroupIdentifier, callback) {
        this.getAssigningAuthorityListCollection(function (error, collection) {
            if (error) {
                callback(error);
            } else {
                collection.find({ GroupIdentifier: GroupIdentifier }, function (error, result) {
                    if (error) {
                        callback(error);
                    }
                    else {
                        result.toArray(callback);
                    }
                });
            }
        });
    };

    userStore.prototype.clearAssigningAuthorityList = function (callback) {
        this.getAssigningAuthorityListCollection(function (error, collection) {
            if (error) {
                callback(error);
            }
            else {
                collection.remove();
                if (callback) {
                    callback();
                }
            };
        })
    };

    userStore.prototype.createAssigningAuthorityListEntry = function (assigningAuthorityListEntry, callback) {
        console.log('createAssigningAuthorityListEntry called');
        console.log(assigningAuthorityListEntry);
        this.getAssigningAuthorityListCollection(function (error, collection) {
            console.log('getAssigningAuthorityListCollection called');
            if (error) {
                callback(error);
            }
            else {
                collection.insert(assigningAuthorityListEntry, function (error, result) {
                    callback(error, assigningAuthorityListEntry);
                });
            }
        });
    };

    userStore.prototype.close = function(){
        this.db.close();
    };


    return new userStore();
}