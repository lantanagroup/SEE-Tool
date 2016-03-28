

exports.get = function (data, dataStores, req, res, log) {
    var id = data.groupIdentifier;

    //get payload
    if (id) {
        //lookup and return the document
        dataStores.OrganizationStore.getOrganizationByGroupIdentifier(id, function (error, organization) {
            if (error) {
                log.error("Error on get organization:", error);

                res.sendError("There was an error gettng the organization requested.");
            }
            else {
                res.send(organization);
            }
        });

    } else {
        log.error("Invalid parameter to get organization, expected Id");
        res.missingParameters("id");
    }
};

exports.post = function (data, dataStores, req, res, log) {
    var org = data.organization;

    //get payload
    if (org) {
        //lookup and return the document
        dataStores.OrganizationStore.updateOrganization(org, function (error, result) {
            if (error) {
                log.error("Error on get organization:", error);

                res.sendError("There was an error gettng the organization requested.");
            }
            else {
                res.send(result);
            }
        });

    } else {
        log.error("Invalid parameter to get organization, expected Id");
        res.missingParameters("id");
    }
};