var assert = require("assert"),
    expect = require('expect.js'),
    cda = require("../utils/xml.js").cda,
    DOMParser = require('xmldom').DOMParser,
    XmlSerializer = require('xmldom').XMLSerializer,
    xmlUtils = require("../utils/xml.js").xml,
    VitalEntryCreator = require("../Model/VitalEntry.js"),
    VitalSectionCreator = require("../Model/VitalSection.js"),
    Σ = xmlUtils.CreateNode,
    A = xmlUtils.CreateAttributeWithNameAndValue,
    exporter = require("../CDA/ModeltoCDA.js").cda;

var createMockEntry = function (num) {
    var entry = VitalEntryCreator.create();
    entry.id = num;
    entry.TimeRecorded = (new Date()).toString("yyyyMMddHHMMSS");
    entry.Height = num * 1;
    entry.HeightUnit = 'cm';
    entry.Weight = num * 2;
    entry.WeightUnit = "kg";
    entry.BMI = num * 3;
    entry.SystolicBP = num * 4;
    entry.DiastolicBP = num * 5;
    entry.HeartRate = num * 6;
    entry.RespiratoryRate = num * 7;
    entry.Pulse = num * 8;
    entry.O2Sat = num * 9;
    entry.Temperature = num * 10;
    entry.TemperatureUnit = "Cel";

    return entry;
};

describe("Build Vitals Section.", function () {
    var checkHeaderElements = function (componentNode) {        
        assert.equal(componentNode.getElementsByTagName("section").length, 1);
        var sectionNode = componentNode.getElementsByTagName("section")[0];
        assert.equal(sectionNode.getElementsByTagName("templateId").length >= 1, true); //must have at least 1
        var templateIdNode = sectionNode.getElementsByTagName("templateId")[0];
        assert.equal(templateIdNode.getAttributeNode("root").value, "2.16.840.1.113883.10.20.22.2.4");
        var codeNode = sectionNode.getElementsByTagName("code")[0];
        assert.equal(codeNode.getAttributeNode("code").value, "8716-3");
        assert.equal(codeNode.getAttributeNode("codeSystem").value, "2.16.840.1.113883.6.1");
        assert.equal(codeNode.getAttributeNode("codeSystemName").value, "LOINC");
        assert.equal(codeNode.getAttributeNode("displayName").value, "VITAL SIGNS");
        var titleNode = sectionNode.getElementsByTagName("title")[0];
        assert.equal(titleNode !== null, true);        
        assert.equal(titleNode.childNodes[0].nodeValue, "VITAL SIGNS");
    };


    it("Should be able to construct vital section with no VitalEntry.", function () {
        var e = new exporter.VitalsSection();
        var document = new DOMParser().parseFromString("<?xml version='1.0' standalone='yes'?><ClinicalDocument xmlns:xsi='http://www.w3.org/2001/XMLSchema-instance' xsi:schemaLocation='urn:hl7-org:v3 CDA/infrastructure/cda/CDA_SDTC.xsd' xmlns='urn:hl7-org:v3' xmlns:cda='urn:hl7-org:v3' xmlns:sdtc='urn:hl7-org:sdtc'></ClinicalDocument>", "text/xml");
        var section = VitalSectionCreator.create();
        var adapter = new exporter.VitalsSection();
        var node = adapter.BuildAll(section, document);
        checkHeaderElements(node);
        var sectionNode = node.getElementsByTagName("section")[0];        
        assert.equal(sectionNode.getElementsByTagName("entry").length, 0);
    });

    it("Should be able to construct vital section with one VitalEntry.", function () {
        var e = new exporter.VitalsSection();
        var document = new DOMParser().parseFromString("<?xml version='1.0' standalone='yes'?><ClinicalDocument xmlns:xsi='http://www.w3.org/2001/XMLSchema-instance' xsi:schemaLocation='urn:hl7-org:v3 CDA/infrastructure/cda/CDA_SDTC.xsd' xmlns='urn:hl7-org:v3' xmlns:cda='urn:hl7-org:v3' xmlns:sdtc='urn:hl7-org:sdtc'></ClinicalDocument>", "text/xml");
        var section = VitalSectionCreator.create();
        section.Vitals.push(createMockEntry(1));
        var adapter = new exporter.VitalsSection();
        var node = adapter.BuildAll(section, document);        
        checkHeaderElements(node);
        var sectionNode = node.getElementsByTagName("section")[0];
        assert.equal(sectionNode.getElementsByTagName("entry").length, 1);
    });

    it("Should be able to construct vital section with multiple VitalEntries.", function () {
        var document = new DOMParser().parseFromString("<?xml version='1.0' standalone='yes'?><ClinicalDocument xmlns:xsi='http://www.w3.org/2001/XMLSchema-instance' xsi:schemaLocation='urn:hl7-org:v3 CDA/infrastructure/cda/CDA_SDTC.xsd' xmlns='urn:hl7-org:v3' xmlns:cda='urn:hl7-org:v3' xmlns:sdtc='urn:hl7-org:sdtc'></ClinicalDocument>", "text/xml");
        var section = VitalSectionCreator.create();
        section.Vitals.push(createMockEntry(1));
        section.Vitals.push(createMockEntry(2));
        section.Vitals.push(createMockEntry(3));
        var adapter = new exporter.VitalsSection();
        var node = adapter.BuildAll(section, document);
        checkHeaderElements(node);
        var sectionNode = node.getElementsByTagName("section")[0];
        assert.equal(sectionNode.getElementsByTagName("entry").length, section.Vitals.length);
    });

    describe("Use Helper Methods.", function () {
        it("Should build the title", function () {
            var document = new DOMParser().parseFromString("<?xml version='1.0' standalone='yes'?><ClinicalDocument xmlns:xsi='http://www.w3.org/2001/XMLSchema-instance' xsi:schemaLocation='urn:hl7-org:v3 CDA/infrastructure/cda/CDA_SDTC.xsd' xmlns='urn:hl7-org:v3' xmlns:cda='urn:hl7-org:v3' xmlns:sdtc='urn:hl7-org:sdtc'></ClinicalDocument>", "text/xml");
            var section = VitalSectionCreator.create();
            var adapter = new exporter.VitalsSection();
            var titleNode = adapter.BuildTitle(section, document);            
            assert.equal(titleNode.childNodes.length, 1);
            assert.equal(titleNode.childNodes[0].nodeValue, "VITAL SIGNS");
        });

        it("Should build observation", function () {
            var document = new DOMParser().parseFromString("<?xml version='1.0' standalone='yes'?><ClinicalDocument xmlns:xsi='http://www.w3.org/2001/XMLSchema-instance' xsi:schemaLocation='urn:hl7-org:v3 CDA/infrastructure/cda/CDA_SDTC.xsd' xmlns='urn:hl7-org:v3' xmlns:cda='urn:hl7-org:v3' xmlns:sdtc='urn:hl7-org:sdtc'></ClinicalDocument>", "text/xml");
            var section = VitalSectionCreator.create();
            var adapter = new exporter.VitalsSection();
            var entry = VitalEntryCreator.create();
            section.Vitals.push(createMockEntry(1));

            var node = adapter.BuildObservation(section.Vitals[0], document, "theCode", "theDisplayname", "1", "theUnit");
            assert.equal(node.childNodes.length > 0, true);

            var observationNode = node.getElementsByTagName("observation")[0];
            assert.equal(observationNode.childNodes.length > 0, true);
            assert.equal(observationNode.getAttributeNode("classCode").value, "OBS");
            assert.equal(observationNode.getAttributeNode("moodCode").value, "EVN");

            var templateIdNode = node.getElementsByTagName("templateId")[0];
            assert.equal(templateIdNode.getAttributeNode("root").value, "2.16.840.1.113883.10.20.22.4.27");

            var idNode = node.getElementsByTagName("id")[0];
            assert.equal(templateIdNode.getAttributeNode("root").value !== null, true);

            var code = node.getElementsByTagName("code")[0];  
            assert.equal(code !== null, true);
            assert.equal(code.getAttributeNode("codeSystem").value, "2.16.840.1.113883.6.1");
            assert.equal(code.getAttributeNode("codeSystemName").value, "LOINC");
            assert.equal(code.getAttributeNode("code").value, "theCode");
            assert.equal(code.getAttributeNode("displayName").value, "theDisplayname");

            var statusCode = node.getElementsByTagName("statusCode")[0];
            assert.equal(statusCode.getAttributeNode("code").value, "completed");

            var entryTime = node.getElementsByTagName("effectiveTime")[0];
            assert.equal(entryTime.getAttributeNode("value").value, cda.toGTSString(section.Vitals[0].TimeRecorded, true));

            var value = node.getElementsByTagName("value")[0];
            assert.equal(value.getAttributeNode("xsi:type").value, "PQ");  
            assert.equal(value.getAttributeNode("value").value, "1");
            assert.equal(value.getAttributeNode("unit").value, "theUnit");

            var interpretationCode = node.getElementsByTagName("interpretationCode")[0];
            assert.equal(interpretationCode.getAttributeNode("code").value, "N");
            assert.equal(interpretationCode.getAttributeNode("codeSystem").value, "2.16.840.1.113883.5.83");
        });

        it("Should not build observation with empty value", function () {
            var document = new DOMParser().parseFromString("<?xml version='1.0' standalone='yes'?><ClinicalDocument xmlns:xsi='http://www.w3.org/2001/XMLSchema-instance' xsi:schemaLocation='urn:hl7-org:v3 CDA/infrastructure/cda/CDA_SDTC.xsd' xmlns='urn:hl7-org:v3' xmlns:cda='urn:hl7-org:v3' xmlns:sdtc='urn:hl7-org:sdtc'></ClinicalDocument>", "text/xml");
            var section = VitalSectionCreator.create();
            var adapter = new exporter.VitalsSection();
            var entry = VitalEntryCreator.create();
            section.Vitals.push(createMockEntry(1));

            var node = adapter.BuildObservation(section.Vitals[0], document, "theCode", "theDisplayname", "", "theUnit");
            assert.equal(node === null, true, "Should not have created an observation since there was no value");
        });

        it("Should build the height", function () {
            var document = new DOMParser().parseFromString("<?xml version='1.0' standalone='yes'?><ClinicalDocument xmlns:xsi='http://www.w3.org/2001/XMLSchema-instance' xsi:schemaLocation='urn:hl7-org:v3 CDA/infrastructure/cda/CDA_SDTC.xsd' xmlns='urn:hl7-org:v3' xmlns:cda='urn:hl7-org:v3' xmlns:sdtc='urn:hl7-org:sdtc'></ClinicalDocument>", "text/xml");            
            var adapter = new exporter.VitalsSection();            
            var entry = createMockEntry(1);
            var node = adapter.BuildHeight(entry, document);
            var value = node.getElementsByTagName("value")[0];
            var code = node.getElementsByTagName("code")[0];
            assert.equal(code.getAttributeNode("code").value, "8302-2");
            assert.equal(code.getAttributeNode("displayName").value, "Height");
            assert.equal(value.getAttributeNode("value").value, "1");
            assert.equal(value.getAttributeNode("unit").value, "cm");
        });

        it("Should build the weight", function () {
            var document = new DOMParser().parseFromString("<?xml version='1.0' standalone='yes'?><ClinicalDocument xmlns:xsi='http://www.w3.org/2001/XMLSchema-instance' xsi:schemaLocation='urn:hl7-org:v3 CDA/infrastructure/cda/CDA_SDTC.xsd' xmlns='urn:hl7-org:v3' xmlns:cda='urn:hl7-org:v3' xmlns:sdtc='urn:hl7-org:sdtc'></ClinicalDocument>", "text/xml");
            var adapter = new exporter.VitalsSection();
            var entry = createMockEntry(1);
            var node = adapter.BuildWeight(entry, document);
            var value = node.getElementsByTagName("value")[0];
            var code = node.getElementsByTagName("code")[0];
            assert.equal(code.getAttributeNode("code").value, "3141-9");
            assert.equal(code.getAttributeNode("displayName").value, "Weight - Measured");
            assert.equal(value.getAttributeNode("value").value, "2");
            assert.equal(value.getAttributeNode("unit").value, "kg");
        });

        it("Should build the bmi", function () {
            var document = new DOMParser().parseFromString("<?xml version='1.0' standalone='yes'?><ClinicalDocument xmlns:xsi='http://www.w3.org/2001/XMLSchema-instance' xsi:schemaLocation='urn:hl7-org:v3 CDA/infrastructure/cda/CDA_SDTC.xsd' xmlns='urn:hl7-org:v3' xmlns:cda='urn:hl7-org:v3' xmlns:sdtc='urn:hl7-org:sdtc'></ClinicalDocument>", "text/xml");
            var adapter = new exporter.VitalsSection();
            var entry = createMockEntry(1);
            var node = adapter.BuildBMI(entry, document);
            var value = node.getElementsByTagName("value")[0];
            var code = node.getElementsByTagName("code")[0];
            assert.equal(code.getAttributeNode("code").value, "39156-5");
            assert.equal(code.getAttributeNode("displayName").value, "BMI (Body Mass Index)");
            assert.equal(value.getAttributeNode("value").value, "3");
            assert.equal(value.getAttributeNode("unit").value, "kg/m2");
        });

        it("Should build the Systolic BP", function () {
            var document = new DOMParser().parseFromString("<?xml version='1.0' standalone='yes'?><ClinicalDocument xmlns:xsi='http://www.w3.org/2001/XMLSchema-instance' xsi:schemaLocation='urn:hl7-org:v3 CDA/infrastructure/cda/CDA_SDTC.xsd' xmlns='urn:hl7-org:v3' xmlns:cda='urn:hl7-org:v3' xmlns:sdtc='urn:hl7-org:sdtc'></ClinicalDocument>", "text/xml");
            var adapter = new exporter.VitalsSection();
            var entry = createMockEntry(1);
            var node = adapter.BuildSystolicBP(entry, document);
            var value = node.getElementsByTagName("value")[0];
            var code = node.getElementsByTagName("code")[0];
            assert.equal(code.getAttributeNode("code").value, "8480-6");
            assert.equal(code.getAttributeNode("displayName").value, "BP Systolic");
            assert.equal(value.getAttributeNode("value").value, "4");
            assert.equal(value.getAttributeNode("unit").value, "mm[Hg]");
        });

        it("Should build the Diastolic BP", function () {
            var document = new DOMParser().parseFromString("<?xml version='1.0' standalone='yes'?><ClinicalDocument xmlns:xsi='http://www.w3.org/2001/XMLSchema-instance' xsi:schemaLocation='urn:hl7-org:v3 CDA/infrastructure/cda/CDA_SDTC.xsd' xmlns='urn:hl7-org:v3' xmlns:cda='urn:hl7-org:v3' xmlns:sdtc='urn:hl7-org:sdtc'></ClinicalDocument>", "text/xml");
            var adapter = new exporter.VitalsSection();
            var entry = createMockEntry(1);
            var node = adapter.BuildDiastolicBP(entry, document);
            var value = node.getElementsByTagName("value")[0];
            var code = node.getElementsByTagName("code")[0];
            assert.equal(code.getAttributeNode("code").value, "8462-4");
            assert.equal(code.getAttributeNode("displayName").value, "BP Diastolic");
            assert.equal(value.getAttributeNode("value").value, "5");
            assert.equal(value.getAttributeNode("unit").value, "mm[Hg]");
        });

        it("Should build the heart rate", function () {
            var document = new DOMParser().parseFromString("<?xml version='1.0' standalone='yes'?><ClinicalDocument xmlns:xsi='http://www.w3.org/2001/XMLSchema-instance' xsi:schemaLocation='urn:hl7-org:v3 CDA/infrastructure/cda/CDA_SDTC.xsd' xmlns='urn:hl7-org:v3' xmlns:cda='urn:hl7-org:v3' xmlns:sdtc='urn:hl7-org:sdtc'></ClinicalDocument>", "text/xml");
            var adapter = new exporter.VitalsSection();
            var entry = createMockEntry(1);
            var node = adapter.BuildHeartRate(entry, document);
            var value = node.getElementsByTagName("value")[0];
            var code = node.getElementsByTagName("code")[0];
            assert.equal(code.getAttributeNode("code").value, "8867-4");
            assert.equal(code.getAttributeNode("displayName").value, "Heart rate");
            assert.equal(value.getAttributeNode("value").value, "6");
            assert.equal(value.getAttributeNode("unit").value, "/min");
        });

        it("Should build the respitory rate", function () {
            var document = new DOMParser().parseFromString("<?xml version='1.0' standalone='yes'?><ClinicalDocument xmlns:xsi='http://www.w3.org/2001/XMLSchema-instance' xsi:schemaLocation='urn:hl7-org:v3 CDA/infrastructure/cda/CDA_SDTC.xsd' xmlns='urn:hl7-org:v3' xmlns:cda='urn:hl7-org:v3' xmlns:sdtc='urn:hl7-org:sdtc'></ClinicalDocument>", "text/xml");
            var adapter = new exporter.VitalsSection();
            var entry = createMockEntry(1);
            var node = adapter.BuildRespitoryRate(entry, document);
            var value = node.getElementsByTagName("value")[0];
            var code = node.getElementsByTagName("code")[0];
            assert.equal(code.getAttributeNode("code").value, "9279-1");
            assert.equal(code.getAttributeNode("displayName").value, "Respiratory rate");
            assert.equal(value.getAttributeNode("value").value, "7");
            assert.equal(value.getAttributeNode("unit").value, "/min");
        });

        it("Should build the pulse", function () {
            var document = new DOMParser().parseFromString("<?xml version='1.0' standalone='yes'?><ClinicalDocument xmlns:xsi='http://www.w3.org/2001/XMLSchema-instance' xsi:schemaLocation='urn:hl7-org:v3 CDA/infrastructure/cda/CDA_SDTC.xsd' xmlns='urn:hl7-org:v3' xmlns:cda='urn:hl7-org:v3' xmlns:sdtc='urn:hl7-org:sdtc'></ClinicalDocument>", "text/xml");
            var adapter = new exporter.VitalsSection();
            var entry = createMockEntry(1);
            var node = adapter.BuildPulse(entry, document);
            var value = node.getElementsByTagName("value")[0];
            var code = node.getElementsByTagName("code")[0];
            assert.equal(code.getAttributeNode("code").value, "temp-pulse-code");
            assert.equal(code.getAttributeNode("displayName").value, "Pulse");
            assert.equal(value.getAttributeNode("value").value, "8");
            assert.equal(value.getAttributeNode("unit").value, "/min");
        });

        it("Should build the O2 saturation", function () {
            var document = new DOMParser().parseFromString("<?xml version='1.0' standalone='yes'?><ClinicalDocument xmlns:xsi='http://www.w3.org/2001/XMLSchema-instance' xsi:schemaLocation='urn:hl7-org:v3 CDA/infrastructure/cda/CDA_SDTC.xsd' xmlns='urn:hl7-org:v3' xmlns:cda='urn:hl7-org:v3' xmlns:sdtc='urn:hl7-org:sdtc'></ClinicalDocument>", "text/xml");
            var adapter = new exporter.VitalsSection();
            var entry = createMockEntry(1);
            var node = adapter.BuildOxygenSaturation(entry, document);
            var value = node.getElementsByTagName("value")[0];
            var code = node.getElementsByTagName("code")[0];
            assert.equal(code.getAttributeNode("code").value, "2710-2");
            assert.equal(code.getAttributeNode("displayName").value, "O2 % BldC Oximetry");
            assert.equal(value.getAttributeNode("value").value, "9");
            assert.equal(value.getAttributeNode("unit").value, "%");
        });

        it("Should build the tempurature", function () {
            var document = new DOMParser().parseFromString("<?xml version='1.0' standalone='yes'?><ClinicalDocument xmlns:xsi='http://www.w3.org/2001/XMLSchema-instance' xsi:schemaLocation='urn:hl7-org:v3 CDA/infrastructure/cda/CDA_SDTC.xsd' xmlns='urn:hl7-org:v3' xmlns:cda='urn:hl7-org:v3' xmlns:sdtc='urn:hl7-org:sdtc'></ClinicalDocument>", "text/xml");
            var adapter = new exporter.VitalsSection();
            var entry = createMockEntry(1);
            var node = adapter.BuildTemperature(entry, document);
            var value = node.getElementsByTagName("value")[0];
            var code = node.getElementsByTagName("code")[0];
            assert.equal(code.getAttributeNode("code").value, "8310-5");
            assert.equal(code.getAttributeNode("displayName").value, "Body Temperature");
            assert.equal(value.getAttributeNode("value").value, "10");
            assert.equal(value.getAttributeNode("unit").value, "Cel");
        });

    });
});