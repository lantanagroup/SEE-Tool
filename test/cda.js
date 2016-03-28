var assert = require("assert"),
    expect = require('expect.js'),
    cda = require("../utils/xml.js").cda,
    DOMParser = require('xmldom').DOMParser,
    XmlSerializer = require('xmldom').XMLSerializer,
    xmlUtils = require("../utils/xml.js").xml,
    personInfo = require("../Model/PersonInfo.js"),
    Σ = xmlUtils.CreateNode,
    A = xmlUtils.CreateAttributeWithNameAndValue;

describe("Build cda fragments.", function () {
    it("Should be able to build templateId with a rootId.", function () {
        var document = new DOMParser().parseFromString("<xml />", "text/xml");  //create blank doc
        var root = "2.16.840.1.113883.10.20.22.2.4.1";

        var actual = cda.BuildTemplateIdWithRoot(root, document);

        expect(actual.nodeName).to.equal("templateId");
        expect(actual.attributes).to.have.length(1);
        expect(actual.getAttributeNode("root").value).to.equal(root);
    });

    it("Should be able to build LOINC codesystem code.", function () {
        var code = "8716-3", displayName = 'VITAL SIGNS';
        var document = new DOMParser().parseFromString("<xml />", "text/xml");  //create blank doc
        var actual = cda.BuildCodedValueLOINC(code, displayName, document);

        expect(actual.getAttributeNode("code").value).to.equal(code);
        expect(actual.getAttributeNode("displayName").value).to.equal(displayName);
        expect(actual.getAttributeNode("codeSystem").value).to.equal("2.16.840.1.113883.6.1");
        expect(actual.getAttributeNode("codeSystemName").value).to.equal("LOINC");
    });

    it("Should be able to build status code.", function () {
        var code = "completed";
        var document = new DOMParser().parseFromString("<xml />", "text/xml"); //create blank doc
        var actual = cda.BuildStatusCode(code, document);

        expect(actual.getAttributeNode("code").value).to.equal(code);
    });

    it("Should be able to build id.", function () {
        var root = "2.16.840.1.113883.10.20.22.4.27";
        var document = new DOMParser().parseFromString("<xml />", "text/xml"); //create blank doc
        var actual = cda.BuildIdWithRoot(root, document);

        expect(actual.getAttributeNode("root").value).to.equal(root);
    });

    it("Should be able to construct reference text.", function () {
        var text = "#vit1";
        var document = new DOMParser().parseFromString("<xml />", "text/xml"); //create blank doc

        var xmlNode = cda.BuildReferenceToText(text, document);

        var found = xmlNode.getElementsByTagName("reference");

        expect(found).to.have.length(1);

        expect(found[0].childNodes[0].nodeValue).to.equal(text);
    });

    describe("code & value", function () {
        it("should generate code value properly.", function () {

            var code = "1234";
            var displayName = "test";
            var document = new DOMParser().parseFromString("<xml />", "text/xml"); //create blank doc

            var actual = cda.BuildSnomedCTValueCD(code, displayName, document);

            expect(actual.getAttributeNode("code").value).to.equal(code);
            expect(actual.getAttributeNode("displayName").value).to.equal(displayName);
            expect(actual.getAttributeNode("codeSystem").value).to.equal("2.16.840.1.113883.6.96");
            expect(actual.getAttributeNode("codeSystemName").value).to.equal("SNOMED-CT");
            expect(actual.getAttributeNode("nullFlavor")).to.be(undefined);
        });

        it("should not generate codeSystem and codeSystemName attributes for missing codes, but provide a nullFlavor.", function () {
            var code = null;
            var displayName = "test";
            var document = new DOMParser().parseFromString("<xml />", "text/xml"); //create blank doc

            var actual = cda.BuildSnomedCTValueCD(code, displayName, document);

            expect(actual.getAttributeNode("code")).to.be(undefined);
            expect(actual.getAttributeNode("displayName").value).to.equal(displayName);
            expect(actual.getAttributeNode("codeSystem")).to.be(undefined);
            expect(actual.getAttributeNode("codeSystemName")).to.be(undefined);
            expect(actual.getAttributeNode("nullFlavor").value).to.equal("UNK");
        });
    });

    describe("performer", function () {
        it("should not generate a performer if there is no name", function () {
            var person = personInfo.create();
            person.Phone = "123-456-7890";

            var document = new DOMParser().parseFromString("<xml />", "text/xml"); //create blank doc

            var actual = cda.BuildPerformer(document, person);

            expect(actual).to.be(null);

        });

        /*
        it("should generate a performer but omit assignedPerson if it is unknown", function () {
            var NPI = "XYQ";
            var phone = "123-456-7890";
            var firstName = "";
            var lastName = "";
            var document = new DOMParser().parseFromString(""); //create blank doc

            var actual = cda.BuildPerformer(firstName, lastName, NPI, phone, document);

            var assignedEntityNode = actual.getElementsByTagName("assignedEntity")[0];

            expect(assignedEntityNode.getElementsByTagName("assignedPerson")).to.be.empty();
        });
        */

        it("should generate a performer with an assignedPerson", function () {
            var person = personInfo.create();
            person.Phone = "123-456-7890";
            person.FirstName = "Happy";
            person.LastName = "Gilmore";
            person.StreetAddress = "123 test lane";
            person.City = "Jacksonville Beach";
            person.State = "FL";
            person.ZipCode = "32250";
            person.Country = "US";
            person.NPI = "123";

            var document = new DOMParser().parseFromString("<xml />", "text/xml"); //create blank doc

            var actual = cda.BuildPerformer(document, person);

            var assignedEntityNode = actual.getElementsByTagName("assignedEntity")[0];

            expect(assignedEntityNode.getElementsByTagName("id")[0].getAttributeNode("extension").value).to.equal(person.NPI);
            expect(assignedEntityNode.getElementsByTagName("telecom")[0].getAttributeNode("value").value).to.equal("tel:" + person.Phone);

            var nameNode = assignedEntityNode.getElementsByTagName("assignedPerson")[0].getElementsByTagName("name")[0];

            expect(nameNode.getElementsByTagName("given")[0].textContent).to.equal(person.FirstName);
            expect(nameNode.getElementsByTagName("family")[0].textContent).to.equal(person.LastName);
        });

        /*
        it("should generate a nullFlavor is NPI is unknown", function () {

            var NPI = "";
            var phone = "123-456-7890";
            var firstName = "Happy";
            var lastName = "Gilmore";


            var document = new DOMParser().parseFromString(""); //create blank doc

            var actual = cda.BuildPerformer(firstName, lastName, NPI, phone, document);

            var assignedEntityNode = actual.getElementsByTagName("assignedEntity")[0];
            var idNode = assignedEntityNode.getElementsByTagName("id")[0];

            expect(idNode.getAttributeNode("nullFlavor").value).to.equal("UNK");
            expect(idNode.getAttributeNode("extension")).to.be(undefined);
            expect(idNode.getAttributeNode("root")).to.be(undefined);
        });
         */
        it("should generate without a phone number", function () {
            var person = personInfo.create();

            person.Phone = "";
            person.FirstName = "Happy";
            person.LastName = "Gilmore";
            person.StreetAddress = "123 test lane";
            person.City = "Jacksonville Beach";
            person.State = "FL";
            person.ZipCode = "32250";
            person.Country = "US";
            person.NPI = "123";

            var document = new DOMParser().parseFromString("<xml />", "text/xml"); //create blank doc

            var actual = cda.BuildPerformer(document, person);

            var assignedEntityNode = actual.getElementsByTagName("assignedEntity")[0];

            expect(assignedEntityNode.getElementsByTagName("telecom")).to.be.empty();

        });
    });

    describe("guardian", function () {
        it("should not generate a guardian if there is no name", function () {
            var person = personInfo.create();

            person.Phone = "123-456-7890";
            person.FirstName = "";
            person.LastName = "";
            var document = new DOMParser().parseFromString("<xml />", "text/xml"); //create blank doc

            var actual = cda.BuildGuardian(document, person);

            expect(actual).to.be(null);

        });

        it("should not generate a guardian if personInfo is null", function () {
            var document = new DOMParser().parseFromString("<xml />", "text/xml"); //create blank doc

            var actual = cda.BuildGuardian(document, null);

            expect(actual).to.be(null);

        });

        it("should generate a complete guardian", function () {
            var person = personInfo.create();

            person.Phone = "123-456-7890";
            person.FirstName = "Happy";
            person.LastName = "Gilmore";
            person.AltPhone = "234-4566";
            person.Pager = "456-7890";
            person.Email = "test@test.com";
            person.StreetAddress = "123 test lane";
            person.City = "Jacksonville Beach";
            person.State = "FL";
            person.ZipCode = "32250";
            person.Country = "US";

            var document = new DOMParser().parseFromString("<xml />", "text/xml"); //create blank doc

            var actual = cda.BuildGuardian(document, person);

            expect(actual.getElementsByTagName("telecom")).to.have.length(4);
            expect(actual.getElementsByTagName("telecom")[0].getAttributeNode("use").value).to.be("HP");
            expect(actual.getElementsByTagName("telecom")[1].getAttributeNode("use").value).to.be("HP");
            expect(actual.getElementsByTagName("telecom")[2].getAttributeNode("use").value).to.be("MC");
            expect(actual.getElementsByTagName("telecom")[3].getAttributeNode("value").value).to.contain("mailto:");

            var nameNode = actual.getElementsByTagName("guardianPerson")[0].getElementsByTagName("name")[0];

            expect(nameNode.getElementsByTagName("given")[0].textContent).to.equal(person.FirstName);
            expect(nameNode.getElementsByTagName("family")[0].textContent).to.equal(person.LastName);
        });

        it("should generate without optional fields", function () {
            var person = personInfo.create();

            person.FirstName = "Happy";
            person.LastName = "Gilmore";

            var document = new DOMParser().parseFromString("<xml />", "text/xml"); //create blank doc

            var actual = cda.BuildGuardian(document, person);

            expect(actual.getElementsByTagName("telecom")).to.be.empty();

            var nameNode = actual.getElementsByTagName("guardianPerson")[0].getElementsByTagName("name")[0];

            expect(nameNode.getElementsByTagName("given")[0].textContent).to.equal(person.FirstName);
            expect(nameNode.getElementsByTagName("family")[0].textContent).to.equal(person.LastName);

        });
    });

    describe("participant", function () {
        it("should not generate a participant if there is no name", function () {
            var person = personInfo.create();

            person.Phone = "123-456-7890";
            person.FirstName = "";
            person.LastName = "";
            var document = new DOMParser().parseFromString("<xml />", "text/xml"); //create blank doc

            var actual = cda.BuildParticipant(document, person);

            expect(actual).to.be(null);

        });

        it("should not generate a participant if personInfo is null", function () {
            var document = new DOMParser().parseFromString("<xml />", "text/xml"); //create blank doc

            var actual = cda.BuildParticipant(document, null);

            expect(actual).to.be(null);

        });

        it("should generate a complete participant", function () {
            var person = personInfo.create();

            person.Phone = "123-456-7890";
            person.FirstName = "Happy";
            person.LastName = "Gilmore";
            person.AltPhone = "234-4566";
            person.Pager = "456-7890";
            person.Email = "test@test.com";
            person.StreetAddress = "123 test lane";
            person.City = "Jacksonville Beach";
            person.State = "FL";
            person.ZipCode = "32250";
            person.Country = "US";

            var document = new DOMParser().parseFromString("<xml />", "text/xml"); //create blank doc

            var actual = cda.BuildParticipant(document, person, "CALLBCK", "ASSIGNED", "407543004", "2.16.840.1.113883.6.96", "Primary Carer", "SNOMED-CT");

            expect(actual.getAttributeNode("typeCode").value).to.equal("CALLBCK");

            var functionCode = actual.getElementsByTagName("functionCode")[0];

            expect(functionCode.getAttributeNode("code").value).to.equal("407543004");
            expect(functionCode.getAttributeNode("codeSystem").value).to.equal("2.16.840.1.113883.6.96");
            expect(functionCode.getAttributeNode("codeSystemName").value).to.equal("SNOMED-CT");
            expect(functionCode.getAttributeNode("displayName").value).to.equal("Primary Carer");

            var entity = actual.getElementsByTagName("associatedEntity")[0];

            expect(entity.getAttributeNode("classCode").value).to.equal("ASSIGNED");

            expect(entity.getElementsByTagName("telecom")).to.have.length(4);
            expect(entity.getElementsByTagName("telecom")[0].getAttributeNode("use").value).to.be("HP");
            expect(entity.getElementsByTagName("telecom")[1].getAttributeNode("use").value).to.be("HP");
            expect(entity.getElementsByTagName("telecom")[2].getAttributeNode("use").value).to.be("MC");
            expect(entity.getElementsByTagName("telecom")[3].getAttributeNode("value").value).to.contain("mailto:");

            var nameNode = entity.getElementsByTagName("associatedPerson")[0].getElementsByTagName("name")[0];

            expect(nameNode.getElementsByTagName("given")[0].textContent).to.equal(person.FirstName);
            expect(nameNode.getElementsByTagName("family")[0].textContent).to.equal(person.LastName);
        });

        it("should generate without optional fields", function () {
            var person = personInfo.create();

            person.FirstName = "Happy";
            person.LastName = "Gilmore";

            var document = new DOMParser().parseFromString("<xml />", "text/xml"); //create blank doc

            var actual = cda.BuildParticipant(document, person, null, null, null, null, null, null);

            expect(actual.getElementsByTagName("telecom")).to.be.empty();
            expect(actual.getElementsByTagName("functionCode")).to.be.empty();
            expect(actual.getAttributeNode("typeCode")).to.be(undefined);

            var entity = actual.getElementsByTagName("associatedEntity")[0];
            var nameNode = entity.getElementsByTagName("associatedPerson")[0].getElementsByTagName("name")[0];

            expect(entity.getAttributeNode("classCode")).to.be(undefined);
            expect(nameNode.getElementsByTagName("given")[0].textContent).to.equal(person.FirstName);
            expect(nameNode.getElementsByTagName("family")[0].textContent).to.equal(person.LastName);

        });
    });

    describe("Build effectiveTime.", function () {
        it("Should generate GTS time string", function () {
            var date = new Date(2013, 2, 6);
            expect(cda.toGTSString(date), "20130206");

            date = new Date(2013, 2, 16);
            expect(cda.toGTSString(date), "20130216");

            date = new Date(2013, 12, 16);
            expect(cda.toGTSString(date), "20131216");
        });

        it("Should generate effective time including time, if specified.", function () {
            var dateLow = null;
            var dateHigh = null;
            var instanceTime = new Date();
            var document = new DOMParser().parseFromString("<xml />", "text/xml"); //create blank doc

            var actual = cda.BuildEffectiveTime(dateLow, dateHigh, instanceTime, true, document, document);
            expect(actual.getAttributeNode("value").value).to.equal(cda.toGTSString(instanceTime, true));
        });

        it("Should not generate effective time without low/high or instance time.", function () {
            var dateLow = null;
            var dateHigh = null;
            var instanceTime = null;
            var document = new DOMParser().parseFromString("<xml />", "text/xml"); //create blank doc

            var actual = cda.BuildEffectiveTime(dateLow, dateHigh, instanceTime, true, document, document);
            expect(actual).to.be(null);
        });

        it("Should generate effective time with only an instance time.", function () {
            var dateLow = null;
            var dateHigh = null;
            var instanceTime = new Date();
            var document = new DOMParser().parseFromString("<xml />", "text/xml"); //create blank doc
            var actual = cda.BuildEffectiveTime(dateLow, dateHigh, instanceTime, true, document, document);

            expect(actual.getAttributeNode("value").value).to.equal(cda.toGTSString(instanceTime, true));
        });

        it("Should generate effective time without low.", function () {
            var dateLow = null;
            var dateHigh = new Date();
            var instanceTime = null;
            var document = new DOMParser().parseFromString("<xml />", "text/xml"); //create blank doc
            var actual = cda.BuildEffectiveTime(dateLow, dateHigh, instanceTime, true, document, document);

            var highNode = actual.getElementsByTagName("high")[0];
            var lowNode = actual.getElementsByTagName("low");

            expect(lowNode).to.be.empty();
            expect(actual.getAttributeNode("value")).to.be(undefined);
            expect(highNode.getAttributeNode("value").value).to.equal(cda.toGTSString(dateHigh, true));
        });

        it("Should generate effective time without high.", function () {
            var dateLow = new Date();
            var dateHigh = null;
            var instanceTime = null;
            var document = new DOMParser().parseFromString("<xml />", "text/xml"); //create blank doc
            var actual = cda.BuildEffectiveTime(dateLow, dateHigh, instanceTime, true, document, document);

            var highNode = actual.getElementsByTagName("high");
            var lowNode = actual.getElementsByTagName("low")[0];

            expect(actual.getAttributeNode("value")).to.be(undefined);
            expect(highNode).to.be.empty();
            expect(lowNode.getAttributeNode("value").value).to.equal(cda.toGTSString(dateLow, true));
        });

        it("Should generate effective time with high/low.", function () {
            var dateLow = new Date();
            var dateHigh = new Date();
            var instanceTime = null;
            var document = new DOMParser().parseFromString("<xml />", "text/xml"); //create blank doc
            var actual = cda.BuildEffectiveTime(dateLow, dateHigh, instanceTime, true, document, document);

            var highNode = actual.getElementsByTagName("high")[0];
            var lowNode = actual.getElementsByTagName("low")[0];

            expect(actual.getAttributeNode("value")).to.be(undefined);
            expect(lowNode.getAttributeNode("value").value).to.equal(cda.toGTSString(dateLow, true));
            expect(highNode.getAttributeNode("value").value).to.equal(cda.toGTSString(dateHigh, true));
        });
    });

    describe("Build PQ value.", function () {
        it("Should not generate value if no value is passed in", function () {
            var value = "";
            var document = new DOMParser().parseFromString("<xml />", "text/xml"); //create blank doc
            var actual = cda.CreateValuePQ(value, null, document);
            assert.equal(actual, null);
        });

        it("Should generate value if value is passed in", function () {
            var value = "10";
            var document = new DOMParser().parseFromString("<xml />", "text/xml"); //create blank doc
            var actual = cda.CreateValuePQ(value, null, document);
            document.appendChild(actual);
            assert.equal(actual !== null, true);

            var valueNode = document.getElementsByTagName("value")[0];
            assert.equal(valueNode.getAttribute("value"), 10);
        });

        it("Should generate value if value and unit is passed in", function () {
            var value = "10", unit = "cm";
            var document = new DOMParser().parseFromString("<xml />", "text/xml"); //create blank doc
            var actual = cda.CreateValuePQ(value, unit, document);
            document.appendChild(actual);

            //assert.equal(actual !== null, true);
            expect(actual).to.not.be(null);

            var valueNode = document.getElementsByTagName("value")[0];
            assert.equal(valueNode.getAttribute("value"), value);
            assert.equal(valueNode.getAttribute("unit"), unit);
        });

    });

    describe("Build interpretation code.", function () {
        it("Should not generate interpretation without code.", function () {
            var code = null, codeSystem = null;
            var document = new DOMParser().parseFromString("<xml />", "text/xml"); //create blank doc
            var actual = cda.CreateInterpretationCodeCE(code, codeSystem, null, null, document, document);
            assert.equal(actual === null, true);
        });

        it("Should not generate interpretation with code and codeSystem.", function () {
            var code = "N", codeSystem = "2.16.840.1.113883.5.83";
            var document = new DOMParser().parseFromString("<xml />", "text/xml"); //create blank doc
            var actual = cda.CreateInterpretationCodeCE(code, codeSystem, null, null, document, document);
            assert.equal(actual !== null, true);
        });
    });

    describe("Build a date object from a GTS string.", function () {
        it("Should build a date object from just a date", function () {
            var dateString = "20121231";
            assert.equal(cda.fromGTSString(dateString).getTime(), (new Date(2012, 11, 31)).getTime());
        });
        it("Should build a date object from a date and time", function () {
            var dateString = "201212311234" //12/31/2012 12:34PM;
            var dateTest = new Date(2012, 11, 31);
            dateTest.setHours(12);
            dateTest.setMinutes(34);
            assert.equal(cda.fromGTSString(dateString).getDate(), dateTest.getDate());
            assert.equal(cda.fromGTSString(dateString).getMonth(), dateTest.getMonth());
            assert.equal(cda.fromGTSString(dateString).getYear(), dateTest.getYear());
            assert.equal(cda.fromGTSString(dateString).getHours(), dateTest.getHours());
        });
    });

    describe("Phone numbers", function () {
        it("should provide a properly formated phone url element when a number is provided", function () {
            var number = "(555)555-2003";

            var document = new DOMParser().parseFromString("<xml />", "text/xml"); //create blank doc
            var actual = cda.BuildPhoneNumber(document, number, "HP");

            expect(actual.getAttributeNode("use").value).to.be("HP");
            expect(actual.getAttributeNode("value").value).to.contain(number);
            expect(actual.getAttributeNode("value").value).to.contain("tel:");
        });

        it("should return null when no number is provided", function () {
            var number = "";

            var document = new DOMParser().parseFromString("<xml />", "text/xml");
            var actual = cda.BuildPhoneNumber(document, number, "HP");

            expect(actual).to.be(null);

            number = null;

            var actual = cda.BuildPhoneNumber(document, number, "HP");

            expect(actual).to.be(null);
        });
    });

    describe("Email address", function () {
        it("should provide a properly formated email url element when one is provided", function () {
            var email = "my.email@address.com";

            var document = new DOMParser().parseFromString("<xml />", "text/xml"); //create blank doc
            var actual = cda.BuildEmailAddress(document, email);

            expect(actual.getAttributeNode("value").value).to.contain(email);
            expect(actual.getAttributeNode("value").value).to.contain("mailto:");
        });

        it("should return null when no email is provided", function () {
            var email = "";

            var document = new DOMParser().parseFromString("<xml />", "text/xml");
            var actual = cda.BuildEmailAddress(document, email);

            expect(actual).to.be(null);

            email = null;

            var actual = cda.BuildEmailAddress(document, email);

            expect(actual).to.be(null);
        });
    });

    describe("Administrative Gender Code", function () {
        it("should provide a properly formated element when data is provided", function () {
            var data = "F";

            var document = new DOMParser().parseFromString("<xml />", "text/xml"); //create blank doc
            var actual = cda.BuildGender(document, data);

            expect(actual.getAttributeNode("code").value).to.contain(data);
        });

        it("should return null when no data is provided", function () {
            var data = "";

            var document = new DOMParser().parseFromString("");
            var actual = cda.BuildGender(document, data);

            expect(actual).to.be(null);

            data = null;

            var actual = cda.BuildGender(document, data);

            expect(actual).to.be(null);
        });
    });

    describe("Entity Name", function () {
        it("should provide a properly formated name element when one is provided", function () {
            var firstName = "happy";
            var middleName = "q";
            var lastName = "gilmore";

            var document = new DOMParser().parseFromString("<xml />", "text/xml"); //create blank doc
            var actual = cda.BuildName(document, firstName, middleName, lastName);

            expect(actual.getAttributeNode("use").value).to.be("L");
            expect(actual.getElementsByTagName("given")).to.have.length(2);
            expect(actual.getElementsByTagName("given")[0].textContent).to.be(firstName);
            expect(actual.getElementsByTagName("given")[1].textContent).to.be(middleName);
            expect(actual.getElementsByTagName("family")[0].textContent).to.be(lastName);
        });

        it("should return null when no name information is provided", function () {
            var firstName = "";
            var middleName = "";
            var lastName = "";

            var document = new DOMParser().parseFromString("<xml />", "text/xml");
            var actual = cda.BuildName(document, firstName, middleName, lastName);

            expect(actual).to.be(null);

            firstName = null;
            middleName = null;
            lastName = null;

            actual = cda.BuildName(document, firstName, middleName, lastName);

            expect(actual).to.be(null);
        });

        it("should not return elements for missing name parts", function () {
            var firstName = "happy";
            var middleName = "";
            var lastName = "";

            var document = new DOMParser().parseFromString("<xml />", "text/xml");
            var actual = cda.BuildName(document, firstName, middleName, lastName);

            expect(actual.getElementsByTagName("given")[0].textContent).to.be(firstName);
            expect(actual.getElementsByTagName("given")).to.have.length(1);
            expect(actual.getElementsByTagName("family")).to.have.length(0);

            firstName = null;
            middleName = null;
            lastName = "gilmore";

            actual = cda.BuildName(document, firstName, middleName, lastName);

            expect(actual.getElementsByTagName("given")).to.have.length(0);
            expect(actual.getElementsByTagName("family")[0].textContent).to.be(lastName);
        });
    });

    describe("Address", function () {
        it("should build a full set of data when all parts are present", function () {
            var streetAddressLine = "2222 Home Street";
            var city = "Ann Arbor";
            var state = "MI";
            var postalCode = "97857";
            var country = "US";

            var document = new DOMParser().parseFromString("<xml />", "text/xml"); //create blank doc
            var actual = cda.BuildAddress(document, "HP", streetAddressLine, city, state, postalCode, country);

            expect(actual.getAttributeNode("use").value).to.be("HP");
            expect(actual.getElementsByTagName("city")[0].textContent).to.be(city);
            expect(actual.getElementsByTagName("state")[0].textContent).to.be(state);
            expect(actual.getElementsByTagName("postalCode")[0].textContent).to.be(postalCode);
            expect(actual.getElementsByTagName("country")[0].textContent).to.be(country);

        });
        it("should not include elements if they are not provided", function () {
            var streetAddressLine = "";
            var city = "";
            var state = "";
            var postalCode = "";
            var country = "";

            var document = new DOMParser().parseFromString("<xml />", "text/xml"); //create blank doc
            var actual = cda.BuildAddress(document, "HP", streetAddressLine, city, state, postalCode, country);

            expect(actual.getAttributeNode("use").value).to.be("HP");
            expect(actual.getElementsByTagName("city")).to.be.empty();
            expect(actual.getElementsByTagName("state")).to.be.empty();
            expect(actual.getElementsByTagName("postalCode")).to.be.empty();
            expect(actual.getElementsByTagName("country")).to.be.empty();
        });
    });
});