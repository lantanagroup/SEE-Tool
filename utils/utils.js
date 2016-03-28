var moment = require('moment'),
    config = require('config').Settings,
    exporter = require("../CDA/ModeltoCDA.js").cda,
    XmlSerializer = require('xmldom').XMLSerializer,
    DOMParser = require('xmldom').DOMParser,
    fileSystem = require('fs'),
    xml = require("./xml.js").xml;



exports.BuildFileDropPathAndName = function (document) {
    //TODO: need to flesh out requirements more and possibly get more info in document (patient id) so we can change naming to PATIENTID_DOCID_DATETIME or final naming convention
    var now = moment();
    return config.fileDropLocation + document.DocumentInfo.Header.Patient.PersonInfo.LastName + "_" + document._id + "_" + now.format("MM-DD-YY") + ".xml";
};

exports.TransformCDAModelToXml = function (document) {
    var headerString, //= readHeaderIfExists(),
        docString, cdaModel, cdaXml;

    //docString = addStructuredBodyIfNotExists(headerString);
    var cdaModel = new exporter.BuildAll(document); //, docString);
    var cdaXml = (new XmlSerializer()).serializeToString(cdaModel);
    return cdaXml;
};

var readHeaderIfExists = function () {
    var fn = config.sampleHeaderLocation + "header.xml";  //read sample header for now
    if (fileSystem.existsSync(fn) === true) {
        return fileSystem.readFileSync(fn, "utf8");
    }
};

var addStructuredBodyIfNotExists = function (docString) {
    var cdaDocument = new DOMParser().parseFromString(docString, 'text/xml'),
        clidoc = cdaDocument.getElementsByTagName("ClinicalDocument")[0],
        component = cdaDocument.getElementsByTagName("component")[0],
        structuredBody,
        Σ = xml.CreateNode,
        A = xml.CreateAttributeWithNameAndValue,
        x = cdaDocument;

    if (component) {
        structuredBody = component.getElementsByTagName("structuredBody")[0];
        if (structuredBody) {
            return;
        }
    }

    var body = Σ(x, "component",
                Σ(x, "structuredBody"));
    clidoc.appendChild(body);
    return (new XmlSerializer()).serializeToString(cdaDocument);
};
