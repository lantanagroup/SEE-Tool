var DOMParser = require('xmldom').DOMParser,
    XmlSerializer = require('xmldom').XMLSerializer,
    documentCreator = require("../Model/Document.js"),
    DocumentStatusCode = require("../Model/Enum/enum.js").DocumentStatusCode,
    Q = require("q");
    _ = require("underscore");


//etl = extract, transform, load
exports.create = function () {

    var etl = function () {
        var self = this;

        var dateFromGTSString = function (gts) {
            if (gts.length >= 8) {
                var year = gts.substr(0, 4);
                var month = gts.substr(4, 2);
                var day = gts.substr(6, 2);
                return new Date(year, month - 1, day);
            }

            return null;
        }

        var formatDate = function (d) {
            return (d.getMonth() + 1) + "/" + d.getDate() + "/" + d.getFullYear();
        };


        var findFirstElement = function (elementName, node) {
            try
            {
                var el = node.getElementsByTagName(elementName);

                if (el) {
                    if (el.length && el.length > 0) {
                        return el[0];
                    }
                }

               // moveToErr("Cannot find element: '" + elementName + "'");
            }
            catch (err) {
                //moveToErr(err);
            }
        };

        self.transform = function (contents, user) {
            if (!contents || contents.length === 0) {
                throw("No Document contents exist!");
            }

            var headerLocation = contents.indexOf("<ClinicalDocument");
            if (headerLocation < 0) {
                throw("Document contents are not a valid CDA");
            }

            //create document and documentinfo
            var doc = new DOMParser().parseFromString(contents, 'text/xml'),
                doccli = findFirstElement("ClinicalDocument", doc),
                title = findFirstElement("title", doccli),
                recordTarget = findFirstElement("recordTarget", doccli),
                patientRole = findFirstElement("patientRole", recordTarget),
                patient = findFirstElement("patient", patientRole),
                dateCreatedNode = findFirstElement("effectiveTime", doccli),
                idNode = findFirstElement("id", doccli);
           
            var newdocument = documentCreator.create();
            newdocument.CdaXmlDocument.Xml = contents;
            newdocument.DocumentInfo.Title = title.textContent;

            var docid = require("../Model/InstanceIdentifier.js").create();
            docid.Root = idNode.getAttribute('root');
            docid.Extension = idNode.getAttribute('extension');

            newdocument.DocumentInfo.OtherDocumentIdentificationMetadata = docid;
            newdocument.DocumentInfo.DateCreated = (dateCreatedNode === null ? format(new Date()) : dateFromGTSString(dateCreatedNode.getAttribute('value')));
            newdocument.DocumentInfo.DateModified = formatDate(new Date());
            newdocument.DocumentInfo.Status = DocumentStatusCode.FINAL;


            var headerAdapter = require('../CDA/CDAtoModel.js').HeaderAdapter;
            var adapter = new headerAdapter();

            adapter.adaptPatientNode(patientRole, newdocument.DocumentInfo.Patient);

            newdocument.DocumentInfo.DocumentType = "CDA";
            newdocument.DocumentInfo.Author = user.UserName;
            newdocument.DocumentInfo.GroupIdentifier = user.GroupIdentifier;
            
            //console.log("importing '" + title.textContent + "' for patient '" + lastNameNode.textContent + "'");

            return newdocument;
        };

        self.load = function (newdocument, user, documentStore) {
            var deferred = Q.defer();

            if (!newdocument) {
                deferred.reject("No document provided to load");
            }

            //check to see if document already exists
            var metadata = newdocument.DocumentInfo.OtherDocumentIdentificationMetadata;

            documentStore.getDocumentByCDAId(metadata.Extension, metadata.Root, user, function(error, result){
               if (result == null)
               {
                    //create, else we dont want to re-add it
                   documentStore.create(newdocument, function (error, result) {
                        if (error) {
                            deferred.reject("Error on creating document during import: " + error);
                        }
                    });
                }
                deferred.resolve();
                //else return the documentid to the browser?
            });

            return deferred.promise;

        };

    };
    
    return new etl();
};