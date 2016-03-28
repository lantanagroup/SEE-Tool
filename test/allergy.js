var assert = require("assert"),
    expect = require('expect.js'),
    cda = require("../utils/xml.js").cda,
    DOMParser = require('xmldom').DOMParser,
    XmlSerializer = require('xmldom').XMLSerializer,
    xmlUtils = require("../utils/xml.js").xml,
    AllergySectionCreator = require("../Model/AllergySection.js"),
    AllergyEntryCreator = require("../Model/AllergyEntry.js"),
    Σ = xmlUtils.CreateNode,
    A = xmlUtils.CreateAttributeWithNameAndValue,
    adapter = require("../CDA/ModeltoCDA.js").cda;

var createMockAllergyEntry = function(num) {
    var entry = AllergyEntryCreator.create();
    entry.id = num;
    entry.AuthorFirstName = 'First Name ' + num;
    entry.AuthorLastName = 'Last Name ' + num;
    entry.AllergyTo = 'Allergy To ' + num;
    entry.AllergyType = 'Allergy Type ' + num;
    entry.Severity = 'Severity ' + num;
    entry.Reaction = 'Reaction ' + num;
    entry.NoticeDate = new Date('3/1/2011');

    return entry;
};

describe("Build Allergy Section.", function() {

    it("Should be able to generate an entry.", function() {
        var mockEntry = createMockAllergyEntry(1);
        var section = AllergySectionCreator.create();
        section.TransformedNarrative = "<text>Test</text>";
        section.Allergies.push(mockEntry);
        var serializer = new XmlSerializer();

        var e = new adapter.ImmunizationSection();
        var document = new DOMParser().parseFromString("<?xml version='1.0' standalone='yes'?><ClinicalDocument xmlns:xsi='http://www.w3.org/2001/XMLSchema-instance' xsi:schemaLocation='urn:hl7-org:v3 CDA/infrastructure/cda/CDA_SDTC.xsd' xmlns='urn:hl7-org:v3' xmlns:cda='urn:hl7-org:v3' xmlns:sdtc='urn:hl7-org:sdtc'></ClinicalDocument>", "text/xml");
        var cdaAdapter = new adapter.AllergySection();
        var node = cdaAdapter.BuildAll(section, document);

        assert.equal(node.getElementsByTagName("templateId")[0].getAttributeNode("root").value, "2.16.840.1.113883.10.20.22.2.6");
        assert.equal(node.getElementsByTagName("code")[0].getAttributeNode("code").value, "48765-2");
        assert.equal(node.getElementsByTagName("code")[0].getAttributeNode("codeSystem").value, "2.16.840.1.113883.6.1");
        assert.equal(node.getElementsByTagName("code")[0].getAttributeNode("codeSystemName").value, "LOINC");
        assert.equal(node.getElementsByTagName("code")[0].getAttributeNode("displayName").value, "Allergies, adverse reactions, alerts");
        assert.equal(node.getElementsByTagName("title")[0].childNodes[0].nodeValue, "ALLERGIES, ADVERSE REACTIONS, ALERTS");
        assert.notEqual(node.getElementsByTagName("text").length, 0);
    });
});