var org = require("../Model/OrganizationInfo.js"),
    MongoClient = require('mongodb').MongoClient,
    Server = require("mongodb").Server,
    _ = require("underscore"),
    config = require('../config/default.js').Settings;

exports.create = function (onDatabaseOpen) {
    var orgStore = function () {
        var self = this;

        self.db = new require('mongodb').Db('cda_user', new Server(config.dbHost, config.dbPort, { auto_reconnect: true, safe: true }, {}));

        self.db.open(function (error, client) {
            if (error) {
                console.log(error);
            } else {
                client.authenticate(config.dbUser, config.dbPassword, function(err, success){
                    if(err){
                        console.log('Error authenticating user: ' + err);
                    } else {
                        console.log('OrganizationInfo database open');

                        if (onDatabaseOpen) {
                            onDatabaseOpen(self);
                        }
                    }
                });
            }
        });
    };

    orgStore.prototype.getCollection = function (callback) {
        this.db.collection('organization', function (error, collection) {
            if (error) {
                console.log("++++++++++++++  ERROR!!! ++++++++++++++++++");
                console.log("Error on getting collection -> organization");
                console.log(error);
                console.log("+++++++++++++++++++++++++++++++++++++++++++");
                callback(error);
            }
            else {
                callback(null, collection);
            }
        });
    };

    orgStore.prototype.getOrganizationById = function (id, callback) {
        this.getCollection(function (error, collection) {
            if (error) {
                callback(error);
            }
            else {
                //note this uses a UUID.v4 Id and and not a BSON id like the others
                collection.findOne({ Id: id }, function (error, result) {
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

    orgStore.prototype.getOrganizationByGroupIdentifier = function (id, callback) {
        this.getCollection(function (error, collection) {
            if (error) {
                callback(error);
            }
            else {
                collection.findOne({ GroupIdentifier: id }, function (error, result) {
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

    orgStore.prototype.createOrganization = function (organizationInfoObj, callback) {
        this.getCollection(function (error, collection) {
            if (error) {
                callback(error);
            }
            else {
                console.log("inserting organization info");
                collection.insert(organizationInfoObj, callback);
            }
        });
    };

    orgStore.prototype.updateOrganization = function (organization, callback) {
        this.getCollection(function (error, collection) {
            if (error) {
                callback(error);
            }
            else {
                console.log("inserting organization info");
                var id = null;

                if (typeof organization._id == 'string' || organization._id instanceof String)
                    id = collection.db.bson_serializer.ObjectID.createFromHexString(organization._id);
                else
                    id = organization._id;

                console.log("updating organization: " + id);

                collection.update({ _id: id }, {
                    $set: {
                        StreetAddress: organization.StreetAddress ,
                        City: organization.City,
                        State: organization.State,
                        ZipCode: organization.ZipCode,
                        Phone: organization.Phone,
                        AltPhone: organization.AltPhone,
                        Email: organization.Email,
                        Name: organization.Name,
                        Identifiers: organization.Identifiers
                        }
                    },
                    { safe: true },

                    function (error, result) {
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

    orgStore.prototype.removeOrganization = function (orgName, callback) {
        this.getCollection(function (error, collection) {
            if (error) {
                callback(error);
            }
            else {
                collection.remove({ Name: orgName }, { w: 1 }, callback);
            }
        })
    };

    orgStore.prototype.close = function(){
        this.db.close();
    };

    return new orgStore();
}