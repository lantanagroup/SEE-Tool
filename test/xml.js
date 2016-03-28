var assert = require("assert"),
    xml = require("../utils/xml.js").xml,
    CdaUtils = require("../utils/xml.js").cda,
    DOMParser = require('xmldom').DOMParser,
    fileSystem = require('fs'),
    _ = require("underscore");


var xmlString = "<person><firstName>John</firstName><lastName>Baker</lastName></person>";

describe("CreateNode and CreateAttribute", function () {
    it("Should be able to create a node", function () {
        var Σ = xml.CreateNode;
        var x = new DOMParser().parseFromString(xmlString, 'text/xml');
        //console.log(x.documentElement.tagName);
        var node = Σ(x, 'middleName');
        //console.log(node);
        assert.equal(node.nodeName, "middleName");

        var foundNodes = x.getElementsByTagName("firstName");
        assert.equal(foundNodes[0].childNodes[0].nodeValue, "John");        
    });
    
    it("Should be able to create attribute using name and value", function () {
        var Σ = xml.CreateNode;
        var A = xml.CreateAttributeWithNameAndValue;
        var x = new DOMParser().parseFromString(xmlString, 'text/xml');

        var node = xml.CreateNode(x, 'age', A(x, 'years', '39'));
        assert.equal(node.nodeName, 'age');
        assert.equal(node.tagName, 'age');
        assert.equal(node.attributes.length, 1);
        assert.equal(node.attributes[0].name, 'years');
        assert.equal(node.attributes[0].value, '39');
    });    
});

describe("Should find first element", function () {
    it ("Should find first element if it starts with tag name", function () {
        var x = new DOMParser().parseFromString(xmlString, 'text/xml');
        var n = xml.FindFirstElement('person/firstName', x);
    
        assert.equal(n.childNodes[0].nodeValue, 'John');
    });

    it("Should find first element if it starts with a slash", function () {
        var x = new DOMParser().parseFromString(xmlString, 'text/xml');
        var n = xml.FindFirstElement('/person/firstName', x);

        assert.equal(n.childNodes[0].nodeValue, 'John');
    });
});

describe("Should find sections", function () {
    var sampleXml, parsedSampleXml;

    beforeEach(function () {
        sampleXml = fileSystem.readFileSync('./test/resources/MassHIE_Main_Sample_File.xml', "utf8");
        parsedSampleXml = (new DOMParser()).parseFromString(sampleXml);
    });

    it("Should find section by code and codeSystemOid", function () {
        var structuredBody = xml.FindFirstElement('ClinicalDocument/component/structuredBody', parsedSampleXml),
            vitalSectionModel, vitalSection, organizerNode;
        vitalSection = CdaUtils.FindSectionByCode('8716-3', '2.16.840.1.113883.6.1', structuredBody);
        assert.equal(_.isUndefined(vitalSection), false);
        assert.equal(_.isNull(vitalSection), false);
        assert.equal(vitalSection.childNodes.length > 0, true);
    });

    it("Should find section by templateId", function () {
        var structuredBody = xml.FindFirstElement('ClinicalDocument/component/structuredBody', parsedSampleXml),
            vitalSectionModel, vitalSection, organizerNode;
        vitalSection = CdaUtils.FindSection('2.16.840.1.113883.10.20.22.2.4.1', structuredBody);
        assert.equal(_.isUndefined(vitalSection), false);
        assert.equal(_.isNull(vitalSection), false);
        assert.equal(vitalSection.childNodes.length > 0, true);
    });
});