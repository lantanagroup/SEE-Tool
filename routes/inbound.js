var userStore = require("../Store/UserStore.js").create(),
    orion = require('../utils/orion.js'),
    log = require('npmlog'),
    fs = require('fs'),
    _ = require("underscore"),
    config = require('config').Settings,
    path = require('path');

  var express = require('express');
  var app = express();

  var Q = require("q");
  var etl = require("../utils/etl.js").create();
  var send = require("send");

/*	At the very beginning, Orion Webmail do POST 3rd party web resource passing following parameters.
Parameter Name	Description
filename	The filename of the document being edited.
    mediaUrl	The URL to fetch the document.
    mailboxAddress	The mailbox address of the logged in user to save the draft message to.
    draftsFolderName	The name of the drafts folder to save the draft message to.
    csrfToken	The session CSRF prevention token needed to pass to the attachment upload REST API.
 */
//app.post('/see/inbound', express.bodyParser(), function(req, res){

module.exports = function(){
    app.use(express.json({limit: '10mb'}));
    app.use(express.urlencoded({limit: '10mb'}));

    app.post('/', function(req, res){
        log.level = config.inboundLogLevel || log.level;

        if(config.inboundLogPath != '')
        {
            var logFile = fs.createWriteStream(config.inboundLogPath, { flags: 'a' })
            log.on("log", function(message){
                logFile.write(JSON.stringify(message, null, 4));
                });
        }

        log.http("inbound document POST request received");

        var csrfToken = req.body.csrfToken;
        var mediaUrl = req.body.mediaUrl;
        var userID = req.body.userID; //Orion's userId is really our userName
        var filename = req.body.filename;
        var mailboxAddress = req.body.mailboxAddress;
        var cookies = req.headers['cookie'];

        log.verbose("csrfToken", csrfToken);
        log.verbose("mediaUrl", mediaUrl);
        log.verbose("userID", userID);
        log.verbose("filename", filename);
        log.verbose("mailboxAddress", mailboxAddress);
        log.verbose("headers", JSON.stringify(req.headers));
        log.verbose("cookies received", cookies);

        var getDocument = function(user){
            var documentStore = require("../Store/DocumentStore.js").create();
            var cda = "";

            orion.getDocument(mediaUrl, cookies, log)
               .then(function (content) {
                   log.info("Transforming document.");
                   return etl.transform(content, user);
                   })
               .then(function(transformedDocument){
                   log.info("Loading document.");
                   cda = transformedDocument.CdaXmlDocument.Xml;
                   return etl.load(transformedDocument, user, documentStore);
                   })
               .then(function(){
                    log.info("Document loaded, responding with HTML");

                    var html = fs.readFileSync(path.resolve(__dirname, "../client/viewer.html"), 'utf8');
                    var template = _.template(html);
                    var result = template({ cda: cda, userId: user._id, documentId: 123});

                    res.send(200, result);

                    //send(req, '/')
                    //    .root(path.resolve(__dirname, "../client"))
                    //    .pipe(res);
                    })
               .fail(function(error){
                   log.error(error);
                   res.send(500); 
                   });
        }

        /*
        var getUserByUserName = Q.denodify(userStore.getUserByUserName);
        var createUser = Q.denodify(userStore.createUser);
        var updateUser = Q.denodify(userStore.updateUser);

        getUserByUserName(userId)
            .then(function(result){
                if (result == null)
                {
                    log.info("user '" + userID + "' not found, adding");

                    var user = require('../Model/User.js').create();

                    user.UserName = userID;
                    user.Mailbox = mailboxAddress;
                    user.csrfToken = csrfToken;

                    return createUser(user);
                }
                else
                {
                    log.info("user '" + userID + "' found. Replacing session token");

                    var user = result;
		            user.Mailbox = mailboxAddress;
		            user.csrfToken = csrfToken;

                    return updateUser(user);
                }
                })
            .then(getDocument);
        */
        //check to see if the user exists, if not create
        userStore.getUserByUserName(userID, function(error, result){
            var addrs = require("email-addresses");
            var domain = addrs.parseOneAddress(mailboxAddress).domain;

            if (error || result == null)
            {
                log.info("user '" + userID + "' not found, adding");

                var user = require('../Model/User.js').create();

		        user.UserName = userID;
		        user.Mailbox = mailboxAddress;
		        user.csrfToken = csrfToken;
                user.GroupIdentifier = domain;

                userStore.createUser(user, function(){
                    log.info("user successfully created");

                    getDocument(user);
                });
            }
            else
            {
                log.info("user '" + userID + "' found. Replacing session token");

                var user = result;
		        user.Mailbox = mailboxAddress;
		        user.csrfToken = csrfToken;
                user.GroupIdentifier = domain;

                userStore.updateUserSecurity(user, function(){
                    log.info("user's security information successfully updated");
                    getDocument(user);
                });
            }
        });
    });

    /*
    app.get('/test', function(req, res) {
        userStore.getUserByUserName('angelo.kastroulis', function(error, result) {
            if (error || !result) {
                return res.send(500, 'User not found');
            }

            var user = result;
            user.Mailbox = 'testmailbox';
            user.csrfToken = '1234';
            user.GroupIdentifier = 'somemailbox.com';

            var html = fs.readFileSync(path.resolve(__dirname, "../client/viewer.html"), 'utf8');
            var template = _.template(html);
            var result = template({ cda: undefined, userId: user._id, documentId: 123});
            res.send(200, result);
        });
    });
    */

    app.post('/edit', function(req, res) {
        var documentId = req.body.documentId;
        var userId = req.body.userId;

        req.session.documentId = documentId;

        userStore.getUserById(userId, function (error, user) {
            if (error) {
                log.error("An error occurred while attempting to login. " + error);
                res.send(500, "An error occurred while attempting to login. " + error);
            } else if (user == null){
                log.warn(userId + " does not exist. Request denied.");
                res.send(401, "User does not exist.");
            } else {
                log.verbose("Login successful for " + userId);

                req.session.user = user;

                res.redirect('/see/index.html');
            }
        });
    });

  return app;
}();

