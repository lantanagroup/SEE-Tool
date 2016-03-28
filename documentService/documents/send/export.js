var config = require('config').Settings,
    fileSystem = require('fs'),
    orion = require('../../../utils/orion.js'),
    utils = require('../../../utils/utils.js'),
    uuid = require('../../../utils/uuid.js');


exports.post = function (data, dataStores, req, res, log) {
    var document = data;
    if (!document) {
        log.error("Invalid request, no dcoument attached for sending.");
        res.missingParameters("Document");
        return;
    }

    //log.info("Document retreived, saving to disk.");
    //get session token from user
    //var csrfToken = "testcsrfToken";

    var attachmentGroupId = uuid.v4(); //<-- since I only send 1 document in a batch, this can be used 1 time
    var attachmentId = uuid.v4(); //<-- since this is only used for this function, it does't need to be stored.
    var attachmentName = generateFileName(document);

    var cookies = req.headers['cookie'];
    var messageSubject = "Transfer of Care Summary for " + getPatientName(document);
    var messageBody = "Transfer of Care Summary is attached.";
    var mailboxAddress = req.session.user.Mailbox; //validate for this
    var csrfToken = req.session.user.csrfToken; //validate for this

    log.info("Creating attachment");

    orion.createAttachment(document.CdaXmlDocument.Xml, csrfToken, cookies, attachmentGroupId, attachmentId, attachmentName, log)       
           .then(function () {
               log.info("Attachment uploaded. Creating message.");
               return orion.createMessage(messageSubject, messageBody, cookies, mailboxAddress, attachmentGroupId, attachmentId, log);
           })
           .then(function () {
               //var path = require('path');

               log.info("Message Created.");

               res.send({});
           })
           .fail(function (error) {
               log.error(error);
               res.send(500, error);
           });
};

var generateFileName = function(document){
    var moment = require("moment");
    var _s = require("underscore.string");

    var dob = moment(document.DocumentInfo.Header.Patient.BirthTime).format("YYYY-MM-DD");
    var now = moment().format("YYYY-MM-DD.hhmm");
    var lastName = document.DocumentInfo.Header.Patient.PersonInfo.LastName;
    var firstName = document.DocumentInfo.Header.Patient.PersonInfo.FirstName;

    //PTLastName.PTFirstName.DOBYYYY-MM-DD.TransferSummaryYYYY-MM-DD.HHMM 
    return _s.sprintf("%s.%s.DOB%s.TransferSummary%s.xml", lastName, firstName, dob, now);
};

var getPatientName = function(document){
    var lastName = document.DocumentInfo.Header.Patient.PersonInfo.LastName;
    var firstName = document.DocumentInfo.Header.Patient.PersonInfo.FirstName;

    return firstName + " " + lastName; 
};