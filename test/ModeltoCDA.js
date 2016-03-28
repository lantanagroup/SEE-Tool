var assert = require("assert"),
    expect = require('expect.js'),
    DOMParser = require('xmldom').DOMParser,
    XmlSerializer = require('xmldom').XMLSerializer,
    CdaUtils = require('../utils/xml.js').cda,
    XmlUtils = require('../utils/xml.js').xml,
    documentCreator = require("../Model/Document.js"),
    headerSection = require("../Model/HeaderSection.js"),
    vitalEntryCreator = require("../Model/VitalEntry.js"),
    DocumentStatusCode = require("../Model/Enum/enum.js").DocumentStatusCode,
    _ = require('underscore'),
    fileSystem = require('fs'),
    utils = require("../utils/utils.js"),
    uuidHelper = require("../utils/uuid.js");

describe("Transform into canonical CDA from the greenCDA JSON Model.", function () {

    var createTestHeader = function () {
        var headerModel = headerSection.create();
        headerModel.ConfidentialityCode = "N";
        headerModel.DocumentID = uuidHelper.v4();
        headerModel.DatePatientArrivedAtSendignSite = new Date();
        headerModel.EncounterTime = new Date();
        headerModel.Patient.BirthTime = new Date();
        headerModel.Patient.GenderCode = "M";
        headerModel.Patient.PersonInfo.StreetAddress = "123 test";
        headerModel.Patient.PersonInfo.Phone = "123";
        headerModel.Patient.PersonInfo.AltPhone = "345";
        headerModel.Patient.PersonInfo.Pager = "678";
        headerModel.Patient.PersonInfo.Email = "emnail";
        headerModel.Patient.PersonInfo.FirstName = "Happy";
        headerModel.Patient.PersonInfo.LastName = "Gilmore";
        headerModel.Patient.MaritalStatusCode = "M";
        headerModel.Patient.ReligionCode = "?";
        headerModel.Patient.RaceCode = "W";
        headerModel.Patient.EthnicityCode = "??";
        headerModel.Patient.PrimaryLanguageCode = "en";
        headerModel.Patient.OtherLanguageCode = "el";
        return headerModel;
    };

    var findSection = function (parsedXml, targetTitle) {        
        var component = XmlUtils.FindFirstElement('ClinicalDocument/component/structuredBody', parsedXml);        
        var sections = component.getElementsByTagName("section");
        return _.find(sections, function (section) {
            var titleNode = section.getElementsByTagName("title")[0];
            if (titleNode) {
                if (titleNode.childNodes[0]) {
                    return titleNode.childNodes[0].nodeValue === targetTitle;
                }
            }
            return false;
        });
    };

    var checkNarrative = function (section, transformedNarrative) {
        var text = section.getElementsByTagName("text")[0];
        var textString = (new XmlSerializer()).serializeToString(text);
        
        assert.equal(_.isUndefined(text), false);        
        assert.equal(textString, transformedNarrative);
    }

    it("Should transform with no sections", function () {
        var checkAllAttributes = function (xmlnode) {
            _.each(xmlnode.attributes, function (attr) {
                if (_.isUndefined(attr.value) || _.isNull(attr.value)) {
                    console.log(attr);
                    return false;
                }
            });

            _.each(xmlnode.childNodes, function (node) {
                return checkAllAttributes(node);
            });

            return true;
        }


        var document = documentCreator.create();
        document.DocumentInfo.Header = createTestHeader();
        document.DocumentInfo.Title = 'LONG TERM CARE TRANSFER SUMMARY';
        document.DocumentInfo.DateCreated = new Date(2013, 2, 4);
        document.DocumentInfo.DateModified = new Date(2013, 2, 5);
        document.DocumentInfo.DocumentType = 'CDA';
        document.DocumentInfo.Status = DocumentStatusCode.DRAFT;
        document.DocumentInfo.GroupIdentifier = '1';

        var docString = utils.TransformCDAModelToXml(document);
        assert.equal(!_.isUndefined(docString) &&
            !_.isEmpty(docString) &&
            !_.isNull(docString), true);

        var parsedXml = new DOMParser().parseFromString(docString, 'text/xml');
        var recordTarget = parsedXml.getElementsByTagName('recordTarget')[0];
        var patientRole = recordTarget.getElementsByTagName('patientRole')[0];
        var patient = patientRole.getElementsByTagName('patient')[0];
        var name = patient.getElementsByTagName('name')[0];
        var given = name.getElementsByTagName('given')[0];
        var family = name.getElementsByTagName('family')[0];


        assert.equal(given.childNodes[0].nodeValue, document.DocumentInfo.Header.Patient.PersonInfo.FirstName);
        assert.equal(family.childNodes[0].nodeValue, document.DocumentInfo.Header.Patient.PersonInfo.LastName);

        var component = XmlUtils.FindFirstElement('ClinicalDocument/component/structuredBody', parsedXml);        
        var sections = component.getElementsByTagName("section");
                
        assert.equal(sections.length, 21, "Expected 21 sections, received " + sections.length);
        _.each(sections, function (s) {
            var templateId = s.getElementsByTagName("templateId")[0].getAttribute('root');
            assert.equal(s.getElementsByTagName("title")[0].textContent.length > 0, true, "No title was found for section: " + templateId);
            //console.log(s.getElementsByTagName("title")[0].textContent);
            //console.log(templateId);
        });
    });

    it("Should transform with just text in problem section", function () {
        var document = documentCreator.create();
        document.DocumentInfo.Header = createTestHeader();
        document.DocumentInfo.Title = 'LONG TERM CARE TRANSFER SUMMARY';
        document.DocumentInfo.DateCreated = new Date(2013, 2, 4);
        document.DocumentInfo.DateModified = new Date(2013, 2, 5);
        document.DocumentInfo.DocumentType = 'CDA';
        document.DocumentInfo.Status = DocumentStatusCode.DRAFT;
        document.DocumentInfo.GroupIdentifier = '1';

        document.ProblemSection.FreeNarrative = "This is the free text area";
        document.ProblemSection.GeneratedNarrative = "This is the generated text area";
        document.ProblemSection.TransformedNarrative = "<text><paragraph>" + document.ProblemSection.FreeNarrative + "<br/>" + document.ProblemSection.GeneratedNarrative + "</paragraph></text>";
        var docString = utils.TransformCDAModelToXml(document);
        var parsedXml = new DOMParser().parseFromString(docString, 'text/xml');
        //fileSystem.writeFileSync(utils.BuildFileDropPathAndName(document), docString, 'utf8');
        var problemSection = findSection(parsedXml, 'PROBLEMS');
        assert.equal(_.isUndefined(problemSection), false, "Cannot find the PROBLEMS section");
        checkNarrative(problemSection, document.ProblemSection.TransformedNarrative);
    });

    it("Should transform with a vitals section fully coded", function () {
        var document = documentCreator.create();
        document.DocumentInfo.Header = createTestHeader();
        document.DocumentInfo.Title = 'LONG TERM CARE TRANSFER SUMMARY';
        document.DocumentInfo.DateCreated = new Date(2013, 2, 4);
        document.DocumentInfo.DateModified = new Date(2013, 2, 5);
        document.DocumentInfo.DocumentType = 'CDA';
        document.DocumentInfo.Status = DocumentStatusCode.DRAFT;
        document.DocumentInfo.GroupIdentifier = '1';

        var vitalEntry = vitalEntryCreator.create();
        vitalEntry.Height = 1.1;
        vitalEntry.HeightUnit = "in";
        vitalEntry.Weight = 200;
        vitalEntry.WeightUnit = "kg";
        vitalEntry.BMI = 10;
        vitalEntry.SystolicBP = 20;
        vitalEntry.DiastolicBP = 30;
        vitalEntry.HeartRate = 40;
        vitalEntry.RespiratoryRate = 50;
        vitalEntry.HeartRate = 60;
        vitalEntry.O2Sat = 70;
        vitalEntry.Temperature = 80;
        vitalEntry.TemperatureUnit = "Cel";
        document.VitalsSection.Vitals.push(vitalEntry);
        document.VitalsSection.FreeNarrative = "This is the free narrative";
        document.VitalsSection.GeneratedNarrative = "This is the generated narrative";
        document.VitalsSection.TransformedNarrative = "<text><paragraph>" + document.VitalsSection.FreeNarrative + "<br/>" + document.VitalsSection.GeneratedNarrative + "</paragraph></text>";

        var docString = utils.TransformCDAModelToXml(document);
        //fileSystem.writeFileSync(utils.BuildFileDropPathAndName(document), docString, 'utf8');
        var parsedXml = new DOMParser().parseFromString(docString, 'text/xml');        
        var vitalSection = findSection(parsedXml, 'VITAL SIGNS');

        assert.equal(_.isUndefined(vitalSection), false);
        checkNarrative(vitalSection, document.VitalsSection.TransformedNarrative);
    });

    it("Should transform with an AdvanceDirective section, text only", function () {
        var document = documentCreator.create();
        document.DocumentInfo.Header = createTestHeader();
        document.DocumentInfo.Title = 'LONG TERM CARE TRANSFER SUMMARY';
        document.DocumentInfo.DateCreated = new Date(2013, 2, 4);
        document.DocumentInfo.DateModified = new Date(2013, 2, 5);
        document.DocumentInfo.DocumentType = 'CDA';
        document.DocumentInfo.Status = DocumentStatusCode.DRAFT;
        document.DocumentInfo.GroupIdentifier = '1';

        document.AdvanceDirectivesSection.Title = "ADVANCE DIRECTIVES";
        document.AdvanceDirectivesSection.FreeNarrative = "This is the free text area";
        document.AdvanceDirectivesSection.GeneratedNarrative = "This is the generated text area";
        document.AdvanceDirectivesSection.TransformedNarrative = "<text><paragraph>" + document.AdvanceDirectivesSection.FreeNarrative + "</paragraph></text>";

        var docString = utils.TransformCDAModelToXml(document);
        var parsedXml = new DOMParser().parseFromString(docString, 'text/xml');
        fileSystem.writeFileSync(utils.BuildFileDropPathAndName(document), docString, 'utf8');
        var section = findSection(parsedXml, 'ADVANCE DIRECTIVES');
        assert.equal(_.isUndefined(section), false);
        checkNarrative(section, document.AdvanceDirectivesSection.TransformedNarrative);

    });

    it("Should build a document with other sections.", function () {
        var document = documentCreator.create();
        document.DocumentInfo.Header = createTestHeader();
        document.DocumentInfo.Title = 'LONG TERM CARE TRANSFER SUMMARY';
        document.DocumentInfo.DateCreated = new Date(2013, 2, 4);
        document.DocumentInfo.DateModified = new Date(2013, 2, 5);
        document.DocumentInfo.DocumentType = 'CDA';
        document.DocumentInfo.Status = DocumentStatusCode.DRAFT;
        document.DocumentInfo.GroupIdentifier = '1';

        document.OtherSections.push("<component><section>test</section></component>");

        document.AdvanceDirectivesSection.Title = "ADVANCE DIRECTIVES";
        document.AdvanceDirectivesSection.FreeNarrative = "This is the free text area";
        document.AdvanceDirectivesSection.GeneratedNarrative = "This is the generated text area";
        document.AdvanceDirectivesSection.TransformedNarrative = "<text><paragraph>" + document.AdvanceDirectivesSection.FreeNarrative + "</paragraph></text>";

        var docString = utils.TransformCDAModelToXml(document);
        var parsedXml = new DOMParser().parseFromString(docString, 'text/xml');

        var sections = parsedXml.getElementsByTagName("section");

        expect(sections.length).to.be(22);

        //fileSystem.writeFileSync(utils.BuildFileDropPathAndName(document), docString, 'utf8');
        //var section = findSection(parsedXml, 'ADVANCE DIRECTIVES');
        //assert.equal(_.isUndefined(section), false);
        //checkNarrative(section, document.AdvanceDirectivesSection.TransformedNarrative);

    });
});