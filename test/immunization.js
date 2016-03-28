var assert = require("assert"),
    expect = require('expect.js'),
    cda = require("../utils/xml.js").cda,
    DOMParser = require('xmldom').DOMParser,
    XmlSerializer = require('xmldom').XMLSerializer,
    xmlUtils = require("../utils/xml.js").xml,
    ImmunizationSectionCreator = require("../Model/ImmunizationSection.js"),
    ImmunizationEntryCreator = require("../Model/ImmunizationEntry.js"),
    Σ = xmlUtils.CreateNode,
    A = xmlUtils.CreateAttributeWithNameAndValue,
    adapter = require("../CDA/ModeltoCDA.js").cda;

var createMockImmunizationEntry = function(num) {
    var entry = ImmunizationEntryCreator.create();
    entry.id = num;
    entry.AuthorFirstName = 'First Name ' + num;
    entry.AuthorLastName = 'Last Name ' + num;
    entry.Name = 'Immunization Name ' + num;
    entry.Route = 'Immunization Route ' + num;
    entry.Details = 'Immunization Details ' + num;
    entry.EffectiveTime = new Date('2/1/2011');

    return entry;
};

describe("Build Immunization Section.", function() {

    it("Should be able to generate an entry.", function() {
        var mockEntry = createMockImmunizationEntry(1);
        var section = ImmunizationSectionCreator.create();
        section.TransformedNarrative = "<text>Test</text>";
        section.Immunizations.push(mockEntry);
        var serializer = new XmlSerializer();

        var e = new adapter.ImmunizationSection();
        var document = new DOMParser().parseFromString("<?xml version='1.0' standalone='yes'?><ClinicalDocument xmlns:xsi='http://www.w3.org/2001/XMLSchema-instance' xsi:schemaLocation='urn:hl7-org:v3 CDA/infrastructure/cda/CDA_SDTC.xsd' xmlns='urn:hl7-org:v3' xmlns:cda='urn:hl7-org:v3' xmlns:sdtc='urn:hl7-org:sdtc'></ClinicalDocument>", "text/xml");
        var cdaAdapter = new adapter.ImmunizationSection();
        var node = cdaAdapter.BuildAll(section, document);

        assert.equal(node.getElementsByTagName("templateId")[0].getAttributeNode("root").value, "2.16.840.1.113883.10.20.22.2.2");
        assert.equal(node.getElementsByTagName("code")[0].getAttributeNode("code").value, "11369-6");
        assert.equal(node.getElementsByTagName("code")[0].getAttributeNode("codeSystem").value, "2.16.840.1.113883.6.1");
        assert.equal(node.getElementsByTagName("code")[0].getAttributeNode("codeSystemName").value, "LOINC");
        assert.equal(node.getElementsByTagName("code")[0].getAttributeNode("displayName").value, "History of immunizations");
        assert.equal(node.getElementsByTagName("title")[0].childNodes[0].nodeValue, "IMMUNIZATIONS");
        assert.notEqual(node.getElementsByTagName("text").length, 0);

        //the id is now auto-generated
        //assert.equal(sbadm.getElementsByTagName("id")[0].getAttributeNode("root").value, mockEntry.id); 
    });
});