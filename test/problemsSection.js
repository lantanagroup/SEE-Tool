var assert = require("assert"), expect = require('expect.js'),
    xml = require("../utils/xml.js").xml,
    cda = require("../utils/xml.js").cda,
    DOMParser = require('xmldom').DOMParser,
    PersonInfo = require("../Model/PersonInfo.js"),
    exporter = require("../CDA/ModeltoCDA.js").cda;
    problemModel = require("../Model/ProblemSectionProblem.js");
    

describe("CDA ProblemsSection", function () {
    var e = new exporter.ProblemsSection();
    var date = new Date().toDateString();

    it("should be able to serialize DSM_AXIS entries", function () {
        
        var document = new DOMParser().parseFromString("<xml />", "text/xml"); //create blank doc

        var actual = e.BuildDSMAxis("Axis1", "DSM AXIS 1", date, "ABC", document);

        var observationNode = actual.getElementsByTagName("observation")[0];
        var codeNode = observationNode.getElementsByTagName('code')[0];

        var timeNode = actual.getElementsByTagName("observation")[0]
            .getElementsByTagName("effectiveTime")[0]
            .getElementsByTagName("low")[0];

        var valueNode = actual.getElementsByTagName("observation")[0]
            .getElementsByTagName("value")[0];

        expect(codeNode.getAttributeNode("code").value).to.equal("Axis1");
        expect(codeNode.getAttributeNode("displayName").value).to.equal("DSM AXIS 1");
        expect(timeNode.getAttributeNode("value").value).to.equal(cda.toGTSString(date));
        expect(valueNode.textContent).to.equal("ABC");

        //var output = new window.XMLSerializer().serializeToString(actual);
    });

    it("should be generate a Life Threatening Condition Entry", function () {
        var document = new DOMParser().parseFromString("<xml />", "text/xml"); //create blank doc

        var actual = e.BuildLTC(date, document);

        var timeNode = actual.getElementsByTagName("act")[0]
            .getElementsByTagName("effectiveTime")[0]
            .getElementsByTagName("low")[0];

        var idNode = actual.getElementsByTagName("act")[0]
            .getElementsByTagName("id")[0];

        expect(timeNode.getAttributeNode("value").value).to.equal(cda.toGTSString(date));
        expect(idNode.getAttributeNode("root").value).not.to.equal("");

        //var output = new window.XMLSerializer().serializeToString(actual);
    });

    it("should generate an Entry for a coded problem", function () {
        var document = new DOMParser().parseFromString("<xml />", "text/xml"); //create blank doc

        var p = new problemModel.create();
        var person = new PersonInfo.create();

        p.Code = "1234";
        p.Name = "ABC";
        p.DateOfOnset = new Date("12/1/2000");
        p.ResolutionDate = new Date();
        p.Diagnoser = person;
        person.NPI = "XYQ";
        person.Phone = "123-456-7890";
        person.FirstName = "Happy";
        person.LastName = "Gilmore";
        p.CurrentSeverity = "1";
        //p.CurrentSeverity.Name = "High";
        p.WorstSeverity = "2";
       // p.WorstSeverity.Name = "Medium";

        var actual = e.BuildProblemEntry(p, document);

        var actIdNode = actual.getElementsByTagName("act")[0]
            .getElementsByTagName("id")[0];

        var observationNode = actual.getElementsByTagName("act")[0]
            .getElementsByTagName("entryRelationship")[0]
            .getElementsByTagName("observation")[0];

        //var observationIdNode = observationNode.getElementsByTagName("id")[0];

        var timeNode = actual.getElementsByTagName("act")[0]
            .getElementsByTagName("effectiveTime")[0];

        var timeNode2 = observationNode.getElementsByTagName("effectiveTime")[0];

        var assignedEntityNode = observationNode.getElementsByTagName("performer")[0]
            .getElementsByTagName("assignedEntity")[0];

        var valueNode = observationNode.getElementsByTagName("value")[0];


        expect(valueNode.getAttributeNode("code").value).to.equal(p.Code);
        expect(valueNode.getAttributeNode("displayName").value).to.equal(p.Name);

        expect(timeNode.getElementsByTagName("low")[0].getAttributeNode("value").value).to.equal(cda.toGTSString(p.DateOfOnset));
        expect(timeNode2.getElementsByTagName("low")[0].getAttributeNode("value").value).to.equal(cda.toGTSString(p.DateOfOnset));


        expect(timeNode.getElementsByTagName("high")[0].getAttributeNode("value").value).to.equal(cda.toGTSString(p.ResolutionDate));
        expect(timeNode2.getElementsByTagName("high")[0].getAttributeNode("value").value).to.equal(cda.toGTSString(p.ResolutionDate));

        expect(assignedEntityNode.getElementsByTagName("id")[0].getAttributeNode("extension").value, p.Diagnoser.NPI);
        expect(assignedEntityNode.getElementsByTagName("telecom")[0].getAttributeNode("value").value, "tel:" + p.Diagnoser.Phone);

        var nameNode = observationNode
            .getElementsByTagName("performer")[0]
            .getElementsByTagName("assignedEntity")[0]
            .getElementsByTagName("assignedPerson")[0]
            .getElementsByTagName("name")[0];

        expect(nameNode.getElementsByTagName("given")[0].textContent).to.equal(p.Diagnoser.FirstName);
        expect(nameNode.getElementsByTagName("family")[0].textContent).to.equal(p.Diagnoser.LastName);
        
        var currentSeverityNode = observationNode
            .getElementsByTagName("entryRelationship")[0]
            .getElementsByTagName("observation")[0]
            .getElementsByTagName("value")[0];

        expect(currentSeverityNode.getAttributeNode("code").value).to.equal(p.CurrentSeverity);
        expect(currentSeverityNode.getAttributeNode("displayName").value).to.equal("");

        var worstSeverityNode = observationNode
            .getElementsByTagName("entryRelationship")[1]
            .getElementsByTagName("observation")[0]
            .getElementsByTagName("value")[0];

        expect(worstSeverityNode.getAttributeNode("code").value).to.equal(p.WorstSeverity);
        expect(worstSeverityNode.getAttributeNode("displayName").value).to.equal("");

        //var output = new window.XMLSerializer().serializeToString(actual);
    });

    describe("severity entryRelationship", function () {
        it("should generate a current severity entryRelationship", function () {
            var document = new DOMParser().parseFromString("<xml />", "text/xml"); //create blank doc

            var severityCode = "1";
            var severityName = "High";

            var actual = e.BuildCurrentSeverityEntryRelationship(severityCode, severityName, document);

            var valueNode = actual.getElementsByTagName("observation")[0].getElementsByTagName("value")[0];

            expect(valueNode.getAttributeNode("code").value).to.be.equal(severityCode);
            expect(valueNode.getAttributeNode("displayName").value).to.be.equal(severityName);
        });

        it("should not generate a current severity entryRelationship if there is no code", function () {
            var severityCode = "";
            var severityName = "High";
            var document = new DOMParser().parseFromString("<xml />", "text/xml"); //create blank doc

            var actual = e.BuildCurrentSeverityEntryRelationship(severityCode, severityName, document);

            expect(actual).to.be(null);
        });

        it("should generate a worst severity entryRelationship", function () {
            var document = new DOMParser().parseFromString("<xml />", "text/xml"); //create blank doc

            var severityCode = "1";
            var severityName = "High";

            var actual = e.BuildWorstSeverityEntryRelationship(severityCode, severityName, document);

            var valueNode = actual.getElementsByTagName("observation")[0].getElementsByTagName("value")[0];

            expect(valueNode.getAttributeNode("code").value).to.be(severityCode);
            expect(valueNode.getAttributeNode("displayName").value).to.be(severityName);
        });

        it("should not generate a worst severity entryRelationship if there is no code", function () {
            var severityCode = "";
            var severityName = "High";
            var document = new DOMParser().parseFromString("<xml />", "text/xml"); //create blank doc

            var actual = e.BuildWorstSeverityEntryRelationship(severityCode, severityName, document);

            expect(actual).to.be(null);
        });
    });
});