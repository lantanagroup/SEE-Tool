var documentStore = require("../Store/DocumentStore.js").create(),
    snomedProblemStore = require("../Store/SnomedProblemStore.js").create(),
    medicationStore = require("../Store/MedicationStore.js").create(),
    routeStore = require("../Store/MedicationRouteStore.js").create(),
    userStore = require("../Store/UserStore.js").create(),
    organizationStore = require("../Store/OrganizationStore.js").create(),
    mySecurityMiddleware = require("../middleware/TokenizedSecurity.js"),
    log = require('npmlog'),
    config = require('config').Settings,
    fs = require('fs'),
    url = require('url');

    var express = require('express');
    var app = express();

module.exports = exports = function(){

    app.use(express.json({limit: '10mb'}));
    app.use(express.urlencoded({limit: '10mb'}));

    //This adds sendError and missingParameters to the response object
    
    app.use(require("../middleware/EnhancedResponse")());
    
    app.use(express.cookieParser());
    app.use(express.session({secret:'n[)Xs+c9W10n(8F'}));
    //app.use(express.csrf());

    var stores = {
            DocumentStore: documentStore,
            RouteStore: routeStore,
            MedicationStore: medicationStore,
            SnomedProblemStore: snomedProblemStore,
            UserStore: userStore,
            OrganizationStore: organizationStore
        };

    log.level = config.logLevel || log.level;

    if(config.logPath != '')
    {
        var logFile = fs.createWriteStream(config.logPath, { flags: 'a' })
        log.on("log", function(message){
            logFile.write(JSON.stringify(message, null, 4));
         });
    }

    app.post('/users/login', function(req, res){
        require("../documentService/users/login/export.js").post(req.body, stores, req, res, log);
    });

    //these require authentication... the middleware stores user in session.user
    app.post('/*', mySecurityMiddleware(), function (req, res) {

        var path = url.parse(req.url).pathname;

        var serviceAddr = correctServiceAddress(path); //the mounting process removes the part of the address that was mounted, so we can effectively mount it as anything, and this will still work.

        log.verbose('service call started POST', req.url);
        try {
            //by mounting in the application, then the req.url has the mounted portion removed for us... so we don't have to worry
            //about what the full service url is, as long as our sub folder structure matches
            var service = require("../documentService" + serviceAddr + "export.js");

            if (service.post)
                service.post(req.body, stores, req, res, log);
            else
                res.send(501, "Not Implemented");
        }
        catch (err) {
            log.error("Unhandled exception", err);
            res.sendError(err);
        }

        log.verbose('service call finished', serviceAddr);
    });

    app.get('/*', mySecurityMiddleware(), function (req, res) {
        var path = url.parse(req.url).pathname;

        var serviceAddr = correctServiceAddress(path);

        log.verbose('service call started to GET', req.url);
        try {
             var service = require("../documentService" + serviceAddr + "export.js");

            if (service.get)
                service.get(req.query, stores, req, res, log);
            else
                res.send(501, "Not Implemented");
        }
        catch (err) {
            log.error("Unhandled exception", err);
            res.sendError(err);
        }

        log.verbose('service call finished', serviceAddr);
    });

    app.delete('/*', mySecurityMiddleware(), function (req, res) {
        var path = url.parse(req.url).pathname;

        var serviceAddr = correctServiceAddress(path);

        log.verbose('service call started DELETE', req.url);
        try {
            var service = require("../documentService" + serviceAddr + "export.js");

            if (service.delete)
                service.delete(req.body, stores, req, res, log);
            else
                res.send(501, "Not Implemented");
        }
        catch (err) {
            log.error("Unhandled exception", err);
            res.sendError(err);
        }

        log.verbose('service call finished', serviceAddr);
    });

    //security middleware will intercept the call and respond with 403 Forbidden
    app.put('/*', mySecurityMiddleware(), function (req, res) {
        var path = url.parse(req.url).pathname;

        var serviceAddr = correctServiceAddress(path);

        log.verbose('service call started PUT', req.url);
        try {
            var service = require("../documentService" + serviceAddr + "export.js");

            if (service.put)
                service.put(req.body, stores, req, res, log); //will respond with 404 or 200, depending on data
            else
                res.send(501, "Not Implemented");
        }
        catch (err) {
            log.error("Unhandled exception", err);
            res.sendError(err); //sends 500
        }

        log.verbose('service call finished', serviceAddr);
    });

    return app;
}();

var endsWith = function (str, suffix) {
    if (str[str.length - 1] == suffix) {
        return true;
    }

    return false;
};

var correctServiceAddress = function(address){
    if (!endsWith(address, '/')) {
        address += '/';
    }

    return address;
 };