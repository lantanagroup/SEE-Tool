var DocumentStatusCode = require("../../../../Model/Enum/enum.js").DocumentStatusCode,
    SectionCode = require("../../../../Model/Enum/enum.js").SectionCode,
    VitalSectionAdapter = require('../../../../CDA/CDAtoModel.js').VitalSectionAdapter,
    HeaderAdapter = require('../../../../CDA/CDAtoModel.js').HeaderAdapter,
    GenericSectionAdapter = require('../../../../CDA/CDAtoModel.js').GenericSectionAdapter,
    DocumentSectionToSectionCode = require('../../../../CDA/Constants.js').CONSTANTS.MAP.DocumentSectionToSectionCode,
    Constants = require('../../../../CDA/Constants.js').CONSTANTS,
    CDAtoModelAdapter = require('../../../../CDA/CDAtoModel.js').BuildAll,
    DOMParser = require('xmldom').DOMParser,
    XmlUtils = require('../../../../utils/xml.js').xml,
    CdaUtils = require('../../../../utils/xml.js').cda,
    _ = require('underscore');

var parseDocument = function (sectionCode, document, log) {
    var parsedXml, body, section, code, mapEntry, doccli, headerAdapter;
    log.info("TransformSection->parseDocument called with sectionCode: " + sectionCode);
    if (document.DocumentInfo.Status !== DocumentStatusCode.DRAFT) {
        parsedXml = (new DOMParser()).parseFromString(document.CdaXmlDocument.Xml);
        body = CdaUtils.FindStructuredBody(parsedXml);        
        switch (sectionCode) {
            case SectionCode.ALL:
                return CDAtoModelAdapter(parsedXml);
            case SectionCode.VITAL:
                log.info("TransformSection->parseDocument->SectionCode.VITAL");
                mapEntry = DocumentSectionToSectionCode.findSection('LoincCode', '8716-3');
                log.info("Code: " + mapEntry.LoincCode[0]);
                section = CdaUtils.FindSectionByCode(mapEntry.LoincCode[0], Constants.LOINC.CODESYSTEM, body);
                return VitalSectionAdapter(section);
            case SectionCode.HEADER:
                log.info("TransformSection->parseDocument->SectionCode.HEADER");
                doccli = XmlUtils.FindFirstElement('ClinicalDocument', parsedXml);
                headerAdapter = new HeaderAdapter();
                return headerAdapter.ImportAll(doccli);
            default:
                log.info("TransformSection->parseDocument->Generic Section");
                mapEntry = DocumentSectionToSectionCode.findSection('Enum', sectionCode);
                log.info("Code: " + mapEntry.LoincCode[0]);
                section = CdaUtils.FindSectionByCode(mapEntry.LoincCode[0], Constants.LOINC.CODESYSTEM, body);
                return GenericSectionAdapter(section);
        };
    } else {
        switch (sectionCode) {
            case SectionCode.VITAL:
                return document.VitalSection;
            case SectionCode.HEADER:
                return document.DocumentInfo.Header;
            default:
                mapEntry = DocumentSectionToSectionCode.findSection('Enum', sectionCode);
                if (mapEntry) {
                    log.info("PropertyName: " + mapEntry.DocumentPropertyName);
                    return document[mapEntry.DocumentPropertyName];
                }
                else {
                    log.info("No map entry found.");
                    return null;
                }
        }
    }
};


exports.post = function (data, dataStores, req, res, log) {
    log.info("Transformation service called.");

    if (_.isUndefined(data.sourceDocumentId) || _.isUndefined(data.sectionCode)){
        res.missingParameters("sectionCode, sourceDocumentId");
        return;
    }

    if (data) {
        log.info("Transformation service has a valid payload");
      
        log.verbose(data);
            
        dataStores.DocumentStore.getDocumentById(req.session.user, data.sourceDocumentId, function (error, document) {
            if (error) {
                log.error("Error on retrieve document! ", error);

                res.sendError("There was an error retreiving the document.");
            }
            else {
                try 
                {
                    log.info("Document retrieved for transformSection");
                    var result = parseDocument(data.sectionCode, document, log);
                    if (result) {
                        log.info("Document parsed successfully, sending back green model");
                        res.send(result);
                    }
                    else {
                        log.error("Error parsing document, no model returned from parseDocument.");
                        res.sendError("There was an error parsing the document.");
                    }
                }
                catch (err) {
                    log.error(err);
                    res.sendError("There was an error transforming the document.");
                }
            }
        });
    }
};