var newOrg = require("./Model/OrganizationInfo.js").create(),
    uuid = require("./utils/uuid.js");
var _ = require("underscore");

var errorBanner = function () {
    console.log("+---------------------------------------------------------------------------------+");
    console.log('| Proper use is: node AddOrg.js <FieldName>:"<FieldValue>"                        |');
    console.log('|      FieldName should be one of: Name, StreetAddress, City, State, ZipCode,     |');
    console.log('|        Phone, AltPhone, Email, Root, or Extension.                              |');
    console.log("+---------------------------------------------------------------------------------+");
};

process.argv.forEach(function (val, index, array) {
    if (index >= 2) {
        if (val.indexOf(":") < 0) {
            console.log("Cannot parse ", val);
            errorBanner();
        }

        var parsed = val.split(":");
        var token = parsed[0].toString().toLowerCase();
        if (token === "root") {
            newOrg.Identifiers[0].Root = parsed[1];
        } else if (token === "extension") {
            newOrg.Identifiers[0].Extension = parsed[1];
        }
        else {
            if (_.isUndefined(newOrg[parsed[0]])) {
                console.log("Error: '" + val.toString() + "' not a valid field/value pair for organization.");
                errorBanner();
            }
            newOrg[parsed[0]] = parsed[1];
        }
    }    
});

var IsValidString = function (str) {
    return _.isString(str) && !_.isEmpty(str);
};
//error check
if (!IsValidString(newOrg.Name)) {
    console.log("Name is required.");
    errorBanner();
} else if (!IsValidString(newOrg.StreetAddress)) {
    console.log("Street Address is required.");
    errorBanner();
} else if (!IsValidString(newOrg.City)) {
    console.log("City is required.");
    errorBanner();
} else if (!IsValidString(newOrg.Identifiers[0].Root)) {
    console.log("Root is required.");
    errorBanner();
} else if (!IsValidString(newOrg.Identifiers[0].Extension)) {
    console.log("Extension is required.");
    errorBanner();
} else {
    newOrg.Id = uuid.v4();
//    console.log(newOrg);
    var onStoreReady = function (store) {
        store.createOrganization(newOrg, function (error, newObj) {
            if (error) {
                console.log(error);
            } else {
                console.log("New organization inserted. The new id is ", newOrg.Id);
            }
            process.exit();
        });
    };

    var organizationStore = require("./Store/OrganizationStore.js").create(onStoreReady);
}

