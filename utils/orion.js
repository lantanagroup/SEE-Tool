var config = require("./orionconfig.json");
var https = require('https');
var Q = require("q");
var u = require("url");

if(config.selfSignedCert) {
    process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
}

exports.getDocument = function (mediaUrl, cookies, log) {
    var deferred = Q.defer();

    if(!mediaUrl){
        deferred.reject(new Error("mediaUrl for getDocument is required."));
        return deferred.promise;
    }

    var contents = "";
    var body = "";

    var options = {
      hostname: config.hostname,
      port: config.port,
      path: mediaUrl, //<--path works for http.get, but pathname for http.request...
      method: 'GET',
      headers : { 'cookie': cookies}
    };

    var url = u.format(options);
    log.http("sending request to", url);
    log.http("cookies sent", cookies);

    https.get(options).on('response', function (response) {
        var body = '';
        var i = 0;
        response.on('data', function (chunk) {
            i++;
            body += chunk;
            //console.log('BODY Part: ' + i);
        });
        response.on('end', function () {
            if (response.statusCode == 200)
            {
                //store this in database
                //log.verbose("Document body received", body);

                deferred.resolve(body);
            }
            else
            {
                log.http("Received status", response.statusCode + body);
                deferred.reject(new Error("Received a response of " + response.statusCode + " when attempting to retrieve document.\n" + body));
            } 
        });
    }).on('error', function(err) {
        log.error('', 'Error %s', err.stack);
        //callbackError
        deferred.reject(err);
    });

    return deferred.promise;
};

exports.createAttachment = function(documentXml, csrfToken, cookies, attachmentGroupId, attachmentId, attachmentName, log){
    var deferred = Q.defer();

    if (!documentXml || !csrfToken || !cookies || !attachmentGroupId || !attachmentId || !attachmentName)
    {
        deferred.reject("All parameters are required for createAttachment.");
        return deferred.promise;
    }

    var FormData = require('form-data');
    var form = new FormData();

    form.append('file', documentXml, {
        filename: attachmentName,
        contentType: 'application/cda+xml'
    });

    form.append("attachmentName", attachmentName);
    form.append("attachmentId", attachmentId);

    var options = {
        protocol: 'https:',
         hostname: config.hostname, 
         port: config.port, 
         path: "/actor/current/webmail/attachment/" + attachmentGroupId + "/?csrfToken=" + csrfToken, //<--path works for http.get, but pathname for http.request...
         //query: {"csrfToken" : csrfToken},
         method: "POST",
         headers: form.getHeaders({
             "cookie": cookies, 
             "X-Requested-With": "XMLHttpRequest"} //<--This mimicks an AJAX request
             ) //get the multipart headers, but include cookies

    };

   // var url = u.format(options);
    var url = options.hostname + ":" + options.port + options.path;

    log.info("Sending POST to create attachment to:", url);

    log.verbose("HEADERS Sent:", options.headers);

    
    var req = form.submit(options, function(err, res) {
        if (err)
        {
            log.error('', 'Error %s', err.stack);
            deferred.reject(err);
        }
        else if (res.statusCode == 200) {
            //the only thing we want to know from the response is did it succeed or not...
            log.verbose("POST sent to " + url);
            deferred.resolve();
        }
        else {

            log.warn("Received " + res.statusCode + " from the server for POST to " + url);
            
            log.verbose('HEADERS Received: ', JSON.stringify(res.headers));

            res.on('data', function (chunk) {
                log.verbose('BODY Received: ', chunk.toString('utf8'));
            });

            deferred.reject("Received " + res.statusCode + " from the server for POST to " + url);
        }

    });

    req.on('error', function(e) { //<-- request error
        log.error('', 'Error %s', e.stack);
        deferred.reject(e);
    });

    return deferred.promise;
};

exports.createMessage = function(messageSubject, messageBody, cookies, mailboxAddress, attachmentGroupId, attachmentId, log){
    var deferred = Q.defer();

    if(!cookies || !mailboxAddress || !attachmentGroupId || !attachmentId){
        deferred.reject("createMessage must have cookies, mailboxAddress, attachmentGroupId, and attachmentId.");
        return deferred.promise;
    }

    var options = {
         hostname: config.hostname, 
         port: config.port, 
         path: "/actor/current/webmail/DIRECT/mailboxes/" + mailboxAddress + "/folders/Drafts/messages/create/", //<--path works for http.get, but pathname for http.request...
         method: "POST",
         headers: {
             "cookie:": cookies,
             "X-Requested-With": "XMLHttpRequest",
             "Content-Type": "application/json;charset=utf-8" //"application/vnd.orchestral.Webmail.1_0+json;charset=utf-8"
         }
    };

    //var url = u.format(options);
    var url = options.hostname + ":" + options.port + options.path;

    log.info("Sending POST to create message to:", url);

    var req = new https.request(options, function(res) {
        if (res.statusCode == 201) {
            //the only thing we want to know from the response is did it succeed or not...
            log.verbose("POST sent to " + url);
            deferred.resolve();
        }
        else {

            res.on('data', function (chunk) {
                log.verbose('BODY Received: ', chunk.toString('utf8'));
            });

            log.warn("Received " + res.statusCode + " from the server for POST to " + url);
            deferred.reject("Received " + res.statusCode + " from the server for POST to " + url);
        }
    });
    
    req.on('error', function(e) { //<-- request error
        log.error('', 'Error %s', e.stack);
        deferred.reject(e);
    });
    
    var body = JSON.stringify(
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
        });

    log.verbose("Body", body);
                
    req.end(body);

    return deferred.promise;
};
