var assert = require("assert"),
    expect = require('expect.js'),
    cda = require("../utils/xml.js").cda,
    DOMParser = require('xmldom').DOMParser,
    XmlSerializer = require('xmldom').XMLSerializer,
    xmlUtils = require("../utils/xml.js").xml,
    FunctionalStatusSectionCreator = require("../Model/FunctionalStatusSection.js"),
    FunctionalStatusEntryCreator = require("../Model/FunctionalStatusEntry.js"),
    FunctionalStatusPainScaleEntryCreator = require("../Model/FunctionalStatusPainScaleEntry.js"),
    Σ = xmlUtils.CreateNode,
    A = xmlUtils.CreateAttributeWithNameAndValue,
    adapter = require("../CDA/ModeltoCDA.js").cda;

var createMockEntry = function(num) {
    var entry = FunctionalStatusEntryCreator.create();
    entry.Name = "Name " + num;
    entry.Value = "Value " + num;
    entry.EffectiveTime = new Date().toString();
    return entry;
};

var createMockPainScaleEntry = function (num) {
    var entry = FunctionalStatusPainScaleEntryCreator.create();

    entry.id = num;
    entry.PainScore = 1;
    entry.PainScoreEffectiveTime = '2/1/2013';

    return entry;
};

describe("Build Functional Status Section.", function() {

    it("Should be able to generate an entry for each type.", function() {
        var e = new adapter.FunctionalStatusSection();
        var document = new DOMParser().parseFromString("<?xml version='1.0' standalone='yes'?><ClinicalDocument xmlns:xsi='http://www.w3.org/2001/XMLSchema-instance' xsi:schemaLocation='urn:hl7-org:v3 CDA/infrastructure/cda/CDA_SDTC.xsd' xmlns='urn:hl7-org:v3' xmlns:cda='urn:hl7-org:v3' xmlns:sdtc='urn:hl7-org:sdtc'></ClinicalDocument>", "text/xml");
        var section = FunctionalStatusSectionCreator.create();
        section.Capabilities.push(createMockEntry(1));
        section.Cognitions.push(createMockEntry(1));
        section.DailyLivings.push(createMockEntry(1));
        section.PainScales.push(createMockPainScaleEntry(1));
        var cdaAdapter = new adapter.FunctionalStatusSection();
        var node = cdaAdapter.BuildAll(section, document);
        
        assert.equal(node.getElementsByTagName("title")[0].childNodes[0].nodeValue, "FUNCTIONAL STATUS");
        assert.equal(node.getElementsByTagName("templateId")[0].getAttributeNode("root").value, "2.16.840.1.113883.10.20.22.2.14");
        assert.equal(node.getElementsByTagName("code")[0].getAttributeNode("code").value, "47420-5");


        //var output = new XmlSerializer().serializeToString(node);
        //console.log(output);
    });
});