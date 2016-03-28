var expect = require('expect.js');
var assert = require('assert');
var orion = require('../utils/orion.js');
var orionConfig = require('../utils/orionconfig.json');
var nock = require('nock');
var sinon = require('sinon');
var log = require('npmlog');
var Q = require("q");

describe("Orion", function() {
    var logInfoStub = sinon.stub(log, "info");
    var logHTTPStub = sinon.stub(log, "http");
    var logErrorStub = sinon.stub(log, "error");
    var host = "http://" + orionConfig.hostname + ":" + orionConfig.port;

    afterEach(function(){
        nock.cleanAll();
    })

    describe("GET media interface", function(){
        var mediaUrl = "sampleMediaUrl";
        var cookies = "testcookie";

        it("should retrieve a document from a given mediaUrl", function() {
        
            //this library intercepts HTTP requests and returns whatever you want... great for mocking out Node's HTTP
            var mock = nock(host)
                    .matchHeader('cookie', cookies)
                    .get(mediaUrl)
                    .reply(200, "this is a sample");

            /*
            var failedMock = nock(host)
                    .matchHeader('cookie', null)
                    .get(mediaUrl)
                    .reply(400, "cookies are required");
*/
            return orion.getDocument(mediaUrl, cookies, log);

        });

        it("should fail if the response from a given mediaUrl is not HTTP 200", function() {
        
            //this library intercepts HTTP requests and returns whatever you want... great for mocking out Node's HTTP
            var mock = nock(host)
                    .get(mediaUrl)
                    .reply(404);


            var deferred = Q.defer();

            return orion.getDocument(mediaUrl, cookies, log)
                .then(function (content) {
                    deferred.reject("The rejected request from mediaUrl should have caused getDocument to fail.")
                    })
                .fail(function(error){
                    deferred.resolve();
                    });

            return deferred.promise;
        });

        it("should fail if the mediaUrl is null", function() {
        
            //this library intercepts HTTP requests and returns whatever you want... great for mocking out Node's HTTP
            var mock = nock(host)
                    .get("/")
                    .reply(200, 'this is a sample.');


            var deferred = Q.defer();

            orion.getDocument(null, cookies, log)
                .then(function (content) {
                    deferred.reject("The call should not have occurred without a mediaUrl.")
                    })
                .fail(function(error){
                    deferred.resolve();
                    });
            return deferred.promise;
        });

        it("should fail if the mediaUrl is undefined", function() {
            var mock = nock(host)
                .get("/")
                .reply(200, 'this is a sample.');


            var deferred = Q.defer();
            orion.getDocument(undefined, cookies, log)
                .then(function (content) {
                    deferred.reject("The call should not have occurred without a mediaUrl.")
                })
                .fail(function(error){
                    deferred.resolve();
                });
            return deferred.promise;

        });
    });

    describe("POST to createAttachment", function(){
        var csrf = "testCSRF";
        var attachmentGroupId = "testGroupId";
        var attachmentUrl = "/actor/current/webmail/attachment/" + attachmentGroupId + "/?csrfToken=" + csrf;
        var cookies = "somecookies";
        var attachmentId = "testId";
        var attachmentName = "testName";

        it("should accept a given attachment", function(){
               
            //this library intercepts HTTP requests and returns whatever you want... great for mocking out Node's HTTP
            var mock = nock(host)
                    .matchHeader('cookie', cookies)
                    .matchHeader('X-Requested-With', "XMLHttpRequest")
                    .post(attachmentUrl)
                    .reply(200);

            var document = "<ClinicalDocument />";
            //should have cookies and X-Requested-With

            return orion.createAttachment(document, csrf, cookies, attachmentGroupId, attachmentId, attachmentName, log);
                 
        });

        it("should fail if a document is not provided", function(){
             //this library intercepts HTTP requests and returns whatever you want... great for mocking out Node's HTTP
            var orionMock = nock(host)
                    .post(attachmentUrl)
                .reply(200); //this is set to 200 because it will force a succeed if the internal checks from createAttachment allow it to pass to the http layer. That will then be caught and rejected below because we don't expect it to get this far.

            var deferred = Q.defer();
            orion.createAttachment(null, csrf, cookies, attachmentGroupId, attachmentId, attachmentName, log)       
               .then(function () {
                    deferred.reject("a null document should have caused createAttachment to fail");
               })
               .fail(function (error) {
                    deferred.resolve();
                });   

            return deferred.promise;
        });

        it("should fail if the csrf token is missing", function(){
            var orionMock = nock(host)
                .post(attachmentUrl)
                .reply(404);

            var document = "<ClinicalDocument />";

            var deferred = Q.defer();
            orion.createAttachment(document, null, cookies, attachmentGroupId, attachmentId, attachmentName, log)
                .then(function () {
                    deferred.reject("missing csrf token should have caused createAttachment to fail");
                })
                .fail(function (error) {
                    deferred.resolve();
                });

            return deferred.promise;

        });

        it("should fail if the cookies are missing", function(){
            var orionMock = nock(host)
                .post(attachmentUrl)
                .reply(200); //this is set to 200 because it will force a succeed if the internal checks from createAttachment allow it to pass to the http layer. That will then be caught and rejected below because we don't expect it to get this far.

            var document = "<ClinicalDocument />";

            var deferred = Q.defer();
            orion.createAttachment(document, csrf, null, attachmentGroupId, attachmentId, attachmentName, log)
                .then(function () {
                    deferred.reject("missing cookies should have caused createAttachment to fail");
                })
                .fail(function (error) {
                    deferred.resolve();
                });

            return deferred.promise;

        });

        it("should fail if the attachmentGroupId is missing", function(){
            var orionMock = nock(host)
                .post(attachmentUrl)
                .reply(200); //this is set to 200 because it will force a succeed if the internal checks from createAttachment allow it to pass to the http layer. That will then be caught and rejected below because we don't expect it to get this far.

            var document = "<ClinicalDocument />";

            var deferred = Q.defer();
            orion.createAttachment(document, csrf, cookies, null, attachmentId, attachmentName, log)
                .then(function () {
                    deferred.reject("missing attachmentGroupId should have caused createAttachment to fail");
                })
                .fail(function (error) {
                    deferred.resolve();
                });

            return deferred.promise;
        });

        it("should fail if the attachmentId is missing", function(){
            var orionMock = nock(host)
                .post(attachmentUrl)
                .reply(200); //this is set to 200 because it will force a succeed if the internal checks from createAttachment allow it to pass to the http layer. That will then be caught and rejected below because we don't expect it to get this far.

            var document = "<ClinicalDocument />";

            var deferred = Q.defer();
            orion.createAttachment(document, csrf, cookies, attachmentGroupId, null, attachmentName, log)
                .then(function () {
                    deferred.reject("missing attachmentId should have caused createAttachment to fail");
                })
                .fail(function (error) {
                    deferred.resolve();
                });

            return deferred.promise;
        });

        it("should fail if the attachmentName is missing", function(){
            var orionMock = nock(host)
                .post(attachmentUrl)
                .reply(200); //this is set to 200 because it will force a succeed if the internal checks from createAttachment allow it to pass to the http layer. That will then be caught and rejected below because we don't expect it to get this far.

            var document = "<ClinicalDocument />";

            var deferred = Q.defer();
            orion.createAttachment(document, csrf, cookies, attachmentGroupId, attachmentId, null, log)
                .then(function () {
                    deferred.reject("missing attachmentName should have caused createAttachment to fail");
                })
                .fail(function (error) {
                    deferred.resolve();
                });

            return deferred.promise;
                   
        });

       it("should fail gracefully if remote responds with anything other than HTTP 200 OK", function(){
            //this library intercepts HTTP requests and returns whatever you want... great for mocking out Node's HTTP
            var mock = nock(host)
                    .matchHeader('cookie', cookies)
                    .matchHeader('X-Requested-With', "XMLHttpRequest")
                    .post(attachmentUrl)
                    .reply(404);

            var document = "<ClinicalDocument />";
            //should have cookies and X-Requested-With

           var deferred = Q.defer();

            orion.createAttachment(document, csrf, cookies, attachmentGroupId, attachmentId, attachmentName, log)
               .then(function () {
                  deferred.reject("The rejected request from create attachment should have caused createAttachment to fail.");
               })
               .fail(function (error) {
                    deferred.resolve();
                });

           return deferred.promise;
        });
    });

    describe("POST to createMessage", function(){
        var mailboxAddress = "testAddress";
        var messageSubject = "testSubject";
        var messageBody = "testBody";
        var attachmentGroupId = "testGroupId";
        var messageUrl = "/actor/current/webmail/DIRECT/mailboxes/" + mailboxAddress + "/folders/Drafts/messages/create/";
        var cookies = "somecookies";
        var attachmentId = "testId";
        var attachmentName = "testName";

        it("should accept a given attachment", function(){
               
            //this library intercepts HTTP requests and returns whatever you want... great for mocking out Node's HTTP
            var mock = nock(host)
                    .matchHeader('cookie:', cookies) //we need to verify that cookie has a ':' after it
                    .matchHeader('X-Requested-With', "XMLHttpRequest")
                    .matchHeader('Content-Type', "application/json;charset=utf-8")
                    .post(messageUrl, JSON.stringify(
                    {
                        "subject": messageSubject,
                         "content":{
                             "alternatives":[
                                 {
                                     "contentType": "text/plain",
                                     "value": messageBody
                                 }
                             ]
                         },
                        "attachmentGroupId": attachmentGroupId,
                        "attachmentIds": [ attachmentId ],
                        "draft":true
                    }))
                    .reply(201); //we need to verify that this is correct with Orion

            //this is possible because this it() call of Mocha can accept a promise.
            return orion.createMessage(messageSubject, messageBody, cookies, mailboxAddress, attachmentGroupId, attachmentId, log);

        });

        it("should fail if cookies are not provided", function(){
             //this library intercepts HTTP requests and returns whatever you want... great for mocking out Node's HTTP
            var orionMock = nock(host)
                    .post(messageUrl)
                .reply(200); //this is set to 200 because it will force a succeed if the internal checks from createAttachment allow it to pass to the http layer. That will then be caught and rejected below because we don't expect it to get this far.

            var deferred = Q.defer();
            orion.createMessage(messageSubject, messageBody, null, mailboxAddress, attachmentGroupId, attachmentId, log)
                .then(function () {
                    deferred.reject("missing cookies should have caused createMessage to fail");
                })
                .fail(function (error) {
                    deferred.resolve();
                });

            return deferred.promise;
                   
        });

        it("should fail if mailboxAddress is not provided", function(){
            //this library intercepts HTTP requests and returns whatever you want... great for mocking out Node's HTTP
            var orionMock = nock(host)
                .post(messageUrl)
                .reply(200); //this is set to 200 because it will force a succeed if the internal checks from createAttachment allow it to pass to the http layer. That will then be caught and rejected below because we don't expect it to get this far.

            var deferred = Q.defer();

            orion.createMessage(messageSubject, messageBody, cookies, null, attachmentGroupId, attachmentId, log)
                .then(function () {
                    deferred.reject("missing mailboxAddress should have caused createMessage to fail");
                })
                .fail(function (error) {
                    deferred.resolve();
                });

            return deferred.promise;

        });

        it("should fail if attachmentGroupId is not provided", function(){
            //this library intercepts HTTP requests and returns whatever you want... great for mocking out Node's HTTP
            var orionMock = nock(host)
                .post(messageUrl)
                .reply(200); //this is set to 200 because it will force a succeed if the internal checks from createAttachment allow it to pass to the http layer. That will then be caught and rejected below because we don't expect it to get this far.

            var deferred = Q.defer();

            orion.createMessage(messageSubject, messageBody, cookies, mailboxAddress, null, attachmentId, log)
                .then(function () {
                    deferred.reject("missing attachmentGroupId should have caused createMessage to fail");
                })
                .fail(function (error) {
                    deferred.resolve();
                });

            return deferred.promise;

        });

        it("should fail if attachmentId is not provided", function(){
            //this library intercepts HTTP requests and returns whatever you want... great for mocking out Node's HTTP
            var orionMock = nock(host)
                .post(messageUrl)
                .reply(200); //this is set to 200 because it will force a succeed if the internal checks from createAttachment allow it to pass to the http layer. That will then be caught and rejected below because we don't expect it to get this far.

            var deferred = Q.defer();

            orion.createMessage(messageSubject, messageBody, cookies, mailboxAddress, attachmentGroupId, null, log)
                .then(function () {
                    deferred.reject("missing attachmentId should have caused createMessage to fail");
                })
                .fail(function (error) {
                    deferred.resolve();
                });

            return deferred.promise;

        });

       it("should fail gracefully if remote responds with anything other than HTTP 200 OK", function(){
            //this library intercepts HTTP requests and returns whatever you want... great for mocking out Node's HTTP
           var mock = nock(host)
               .matchHeader('cookie:', cookies) //we need to verify that cookie has a ':' after it
               .matchHeader('X-Requested-With', "XMLHttpRequest")
               .matchHeader('Content-Type', "application/json;charset=utf-8")
               .post(messageUrl, JSON.stringify(
                   {
                       "subject": messageSubject,
                       "content":{
                           "alternatives":[
                               {
                                   "contentType": "text/plain",
                                   "value": messageBody
                               }
                           ]
                       },
                       "attachmentGroupId": attachmentGroupId,
                       "attachmentIds": [ attachmentId ],
                       "draft":true
                   }))
               .reply(404);


           var deferred = Q.defer();

            orion.createMessage(messageSubject, messageBody, cookies, mailboxAddress, attachmentGroupId, attachmentId, log)       
               .then(function () {
                    deferred.reject("The rejected request from create attachment should have caused createAttachment to fail.");
               })
               .fail(function (error) {
                    deferred.resolve();
                });

           return deferred.promise;
        });
    });
});