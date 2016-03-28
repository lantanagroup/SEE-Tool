var expect = require('expect.js'),
    xml = require("../utils/xml.js").xml,
    cda = require("../utils/xml.js").cda,
    personInfo = require("../Model/PersonInfo.js"),
    Patient = require("../Model/Patient.js"),
    OrganizationInfo = require("../Model/OrganizationInfo.js"),
    DOMParser = require('xmldom').DOMParser,
    XMLSerializer = require('xmldom').XMLSerializer,
    exporter = require("../CDA/ModeltoCDA.js").cda,
    headerSection = require("../Model/HeaderSection.js"),
    PersonInfo = require("../Model/PersonInfo.js"),
    XmlSerializer = require('xmldom').XMLSerializer,
    uuidHelper = require("../utils/uuid.js");
    

describe("Generated CDA Header", function () {
    var e = new exporter.CDAHeaderPatient();
    var date = cda.toGTSString(new Date(), true)

    describe("General Header", function () {

        it("should be able to generate basic header information", function () {
            var document = new DOMParser().parseFromString("<ClinicalDocument />"); //create blank doc
            var id = "1234";

            var headerModel = headerSection.create();


            headerModel.ConfidentialityCode = "N";
            headerModel.DocumentID =  uuidHelper.v4();
            headerModel.DatePatientArrivedAtSendingSite = new Date(2013, 4, 19, 0, 0, 0, 0);
            headerModel.EncounterTime = new Date();


            e.AppendHeaderDocumentIdentification(document, headerModel, id);

            //var observationNode = actual.getElementsByTagName("observation")[0];
            //var codeNode = observationNode.getElementsByTagName('code')[0];

            //var timeNode = actual.getElementsByTagName("observation")[0]
            //    .getElementsByTagName("effectiveTime")[0]
            //    .getElementsByTagName("low")[0];

            //var valueNode = actual.getElementsByTagName("observation")[0]
            //    .getElementsByTagName("value")[0];

            var realmCodeNode = document.getElementsByTagName('realmCode')[0];
            expect(realmCodeNode.getAttributeNode("code").value).to.equal("US");


            var typeidNode = document.getElementsByTagName('typeId')[0];

            expect(typeidNode.getAttributeNode("root").value).to.equal("2.16.840.1.113883.1.3");
            expect(typeidNode.getAttributeNode("extension").value).to.equal("POCD_HD000040");


            var templateIdNodes = document.getElementsByTagName('templateId');

            expect(templateIdNodes).to.have.length(2);

            expect(templateIdNodes[0].getAttributeNode("root").value).to.equal("2.16.840.1.113883.10.20.22.1.1");

            //this is the template for the transfer of care document
            expect(templateIdNodes[1].getAttributeNode("root").value).to.equal("2.16.840.1.113883.10.20.22.1.12");


            var idNode = document.getElementsByTagName('id')[0];

            expect(idNode.getAttributeNode("root").value).to.equal(id);

            var codeNode = document.getElementsByTagName('code')[0];

            expect(codeNode.getAttributeNode("code").value).to.equal("18761-7");
            expect(codeNode.getAttributeNode("codeSystem").value).to.equal("2.16.840.1.113883.6.1");

            var titleNode = document.getElementsByTagName('title')[0];

            expect(titleNode.textContent).to.equal("Transfer Summarization Note");

            var effectiveTimeNode = document.getElementsByTagName('effectiveTime')[0];
            var timeString = effectiveTimeNode.getAttributeNode("value").value;

            expect(timeString).to.equal(cda.toGTSString(headerModel.EncounterTime));

            var lowTime = effectiveTimeNode.getElementsByTagName('low')[0];
            //TODO: This is causing CDA validation errors, effectiveTime now only contains value and not low time until a fix is made
            //var lowValue = lowTime.getAttributeNode("value").value;

            //expect(lowValue).to.equal(cda.toGTSString(headerModel.DatePatientArrivedAtSendingSite, false)) ;

            var confidentialityCodeNode = document.getElementsByTagName('confidentialityCode')[0];

            expect(confidentialityCodeNode.getAttributeNode("code").value).to.equal(headerModel.ConfidentialityCode);
            expect(confidentialityCodeNode.getAttributeNode("codeSystem").value).to.equal("2.16.840.1.113883.5.25");

            var languageCodeNode = document.getElementsByTagName('languageCode')[0];

            expect(languageCodeNode.getAttributeNode("code").value).to.equal("en-US");

            //should be able to serialize the resulting model to xml
            var cdaXml = (new XmlSerializer()).serializeToString(headerModel);
            expect(cdaXml.length > 0).to.be(true);
            

        });

        it("should generate a serviceEvent if the performers are specified", function () {
            var document = new DOMParser().parseFromString("<xml />", "text/xml"); //create blank doc


            var principleCarePhysician = new PersonInfo.create();
            var carePlanManager = new PersonInfo.create();
            var principleHealthCareProvider = new PersonInfo.create();
            var principleCareGiver = new PersonInfo.create();
            var anotherTeamMember = new PersonInfo.create();


            principleCarePhysician.FirstName = "Happy";
            principleCarePhysician.LastName = "Gilmore";

            carePlanManager.FirstName = "Chubbs";
            carePlanManager.LastName = "Petersen";

            principleHealthCareProvider.FirstName = "Virginia";
            principleHealthCareProvider.LastName = "Venit";

            principleCareGiver.FirstName = "Shooter";
            principleCareGiver.LastName = "McGavin";

            anotherTeamMember.FirstName = "Mr";
            anotherTeamMember.LastName = "Larson";

            var actual = e.BuildServiceEvent(document, principleCarePhysician, carePlanManager, principleHealthCareProvider, principleCareGiver, [anotherTeamMember]);
            var serviceEvent = actual.getElementsByTagName("serviceEvent")[0];
            var performers = serviceEvent.getElementsByTagName("performer");            

            expect(serviceEvent.getElementsByTagName("performer")).to.have.length(5);

            expect(performers[0].getAttributeNode("typeCode").value).to.equal("PRF")
            expect(performers[0].getElementsByTagName("functionCode")[0].getAttributeNode("code").value).to.equal("PCP")

            expect(performers[1].getAttributeNode("typeCode").value).to.equal("PRF");
            expect(performers[1].getElementsByTagName("functionCode")[0].getAttributeNode("code").value).to.equal("???")

            expect(performers[2].getAttributeNode("typeCode").value).to.equal("PRF");
            expect(performers[2].getElementsByTagName("functionCode")[0].getAttributeNode("code").value).to.equal("???")

            expect(performers[3].getAttributeNode("typeCode").value).to.equal("PRF");
            expect(performers[3].getElementsByTagName("functionCode")[0].getAttributeNode("code").value).to.equal("???")

            expect(performers[4].getAttributeNode("typeCode").value).to.equal("PRF");
            expect(performers[4].getElementsByTagName("functionCode")[0].getAttributeNode("code").value).to.equal("???")

            //should be able to serialize the resulting model to xml
            var cdaXml = (new XmlSerializer()).serializeToString(actual);
            expect(cdaXml.length > 0).to.be(true);


        });

        it("should not generate a serviceEvent if there are no performers", function () {
            var document = new DOMParser().parseFromString("<xml />", "text/xml"); //create blank doc
            var actual = e.BuildServiceEvent(document);

            expect(actual).to.be(null);

        });

        it("should generate a recordTarget from patient data", function () {
            var document = new DOMParser().parseFromString("<xml />", "text/xml"); //create blank doc
            var patient = new Patient.create();
            var guardian = new PersonInfo.create();

            patient.BirthTime = new Date();
            patient.GenderCode = "M";
            patient.PersonInfo = personInfo.create();
            patient.PersonInfo.StreetAddress = "123 test";
            patient.PersonInfo.Phone = "123";
            patient.PersonInfo.AltPhone = "345";
            patient.PersonInfo.Pager = "678";
            patient.PersonInfo.Email = "emnail";
            patient.PersonInfo.FirstName = "Happy";
            patient.PersonInfo.LastName = "Gilmore";
            patient.MaritalStatusCode = "M";
            patient.ReligionCode = "?";
            patient.RaceCode = "W";
            patient.EthnicityCode = "??";
            patient.PrimaryLanguageCode = "en";
            patient.OtherLanguageCode = "el";

            guardian.FirstName = "Chubbs";
            guardian.LastName = "Petersen";

            //expect(patient).to.not.be(null);

            var actual = e.BuildRecordTarget(document, patient, null, guardian);

            //expect(actual).to.not.be(null);

            //expect().fail(typeof(actual));
            // expect().fail((new XMLSerializer()).serializeToString(actual));

            var patientRole = actual.getElementsByTagName('patientRole')[0];

            expect(patientRole.getElementsByTagName("telecom")).to.have.length(4);
            expect(patientRole.getElementsByTagName("telecom")[0].getAttributeNode("use").value).to.be("HP");
            expect(patientRole.getElementsByTagName("telecom")[1].getAttributeNode("use").value).to.be("HP");
            expect(patientRole.getElementsByTagName("telecom")[2].getAttributeNode("use").value).to.be("MC");
            expect(patientRole.getElementsByTagName("telecom")[3].getAttributeNode("value").value).to.contain("mailto:");

            //since we didn't pass in a sending site, we expect it to not exist... that is tested below
            expect(patientRole.getElementsByTagName("providerOrganization")).to.have.length(0);

            var patientNode = patientRole.getElementsByTagName("patient")[0]

            expect(patientNode.getElementsByTagName("name")).to.have.length(1);
            expect(patientNode.getElementsByTagName("administrativeGenderCode")[0].getAttributeNode("code").value).to.equal(patient.GenderCode);
            var maritalStatusCode = patientNode.getElementsByTagName("maritalStatusCode")[0];
            expect(patientNode.getElementsByTagName("maritalStatusCode")[0].getAttributeNode("code").value).to.equal(patient.MaritalStatusCode);
            expect(patientNode.getElementsByTagName("religiousAffiliationCode")[0].getAttributeNode("code").value).to.equal(patient.ReligionCode);
            expect(patientNode.getElementsByTagName("raceCode")[0].getAttributeNode("code").value).to.equal(patient.RaceCode);
            expect(patientNode.getElementsByTagName("ethnicGroupCode")[0].getAttributeNode("code").value).to.equal(patient.EthnicityCode);

            expect(patientNode.getElementsByTagName("languageCommunication")).to.have.length(2);

            expect(patientRole.getElementsByTagName("guardian")).to.have.length(1);
            //expect(patient.getElementsByTagName("administrativeGenderCode")).to.have.length(1);
            //expect(patient.getElementsByTagName("birthTime")).to.have.length(1);

            //should be able to serialize the resulting model to xml
            var cdaXml = (new XmlSerializer()).serializeToString(actual);
            expect(cdaXml.length > 0).to.be(true);


        });

        it("should allow optional patient information to be missing from serialized output", function(){
            var document = new DOMParser().parseFromString("<xml />", "text/xml"); //create blank doc
            var patient = new Patient.create();

            //all we have is a name in this scenario
            patient.PersonInfo = personInfo.create();
            patient.PersonInfo.FirstName = "Happy";
            patient.PersonInfo.LastName = "Gilmore";
            var actual = e.BuildRecordTarget(document, patient, null);

            var patientRole = actual.getElementsByTagName('patientRole')[0];

            expect(patientRole.getElementsByTagName("telecom")).to.be.empty();

            //since we didn't pass in a sending site, we expect it to not exist... that is tested below
            expect(patientRole.getElementsByTagName("providerOrganization")).to.have.length(0);

            var patientNode = patientRole.getElementsByTagName("patient")[0]

            expect(patientNode.getElementsByTagName("name")).to.have.length(1);            

            expect(patientNode.getElementsByTagName("administrativeGenderCode").length).to.be(0);
            expect(patientNode.getElementsByTagName("maritalStatusCode").length).to.be(1); //nullFlavor should be there
            expect(patientNode.getElementsByTagName("religiousAffiliationCode").length).to.be(1);
            expect(patientNode.getElementsByTagName("raceCode").length).to.be(1);
            expect(patientNode.getElementsByTagName("ethnicGroupCode").length).to.be(1);
            //should be able to serialize the resulting model to xml
            var cdaXml = (new XmlSerializer()).serializeToString(actual);
            expect(cdaXml.length > 0).to.be(true);


        });

        it ("should handle null patient identifiers", function () {
            var document = new DOMParser().parseFromString("<xml />", "text/xml"); //create blank doc
            var patient = new Patient.create();

            //all we have is a name in this scenario
            patient.PersonInfo = personInfo.create();
            patient.PersonInfo.FirstName = "Happy";
            patient.PersonInfo.LastName = "Gilmore";
            patient.PersonInfo.Identifiers[0].Root = null;
            patient.PersonInfo.Identifiers[0].Extension = null;            

            var actual = e.BuildRecordTarget(document, patient, null);

            var patientRole = actual.getElementsByTagName('patientRole')[0];

            expect(patientRole.getElementsByTagName("telecom")).to.be.empty();

            //since we didn't pass in a sending site, we expect it to not exist... that is tested below
            expect(patientRole.getElementsByTagName("providerOrganization")).to.have.length(0);

            var patientNode = patientRole.getElementsByTagName("patient")[0]

            expect(patientNode.getElementsByTagName("name")).to.have.length(1);

            expect(patientNode.getElementsByTagName("administrativeGenderCode").length).to.be(0);
            expect(patientNode.getElementsByTagName("maritalStatusCode").length).to.be(1); //nullFlavor should be there
            expect(patientNode.getElementsByTagName("religiousAffiliationCode").length).to.be(1);
            expect(patientNode.getElementsByTagName("raceCode").length).to.be(1);
            expect(patientNode.getElementsByTagName("ethnicGroupCode").length).to.be(1);
            //should be able to serialize the resulting model to xml
            var cdaXml = (new XmlSerializer()).serializeToString(actual);
            expect(cdaXml.length > 0).to.be(true);


        });

        it("should handle undefined patient identifiers", function () {
            var document = new DOMParser().parseFromString("<xml />", "text/xml"); //create blank doc
            var patient = new Patient.create();

            //all we have is a name in this scenario
            patient.PersonInfo = personInfo.create();
            patient.PersonInfo.FirstName = "Happy";
            patient.PersonInfo.LastName = "Gilmore";
            patient.PersonInfo.Identifiers[0].Root = undefined;

            var actual = e.BuildRecordTarget(document, patient, null);

            var patientRole = actual.getElementsByTagName('patientRole')[0];

            expect(patientRole.getElementsByTagName("telecom")).to.be.empty();

            //since we didn't pass in a sending site, we expect it to not exist... that is tested below
            expect(patientRole.getElementsByTagName("providerOrganization")).to.have.length(0);

            var patientNode = patientRole.getElementsByTagName("patient")[0]

            expect(patientNode.getElementsByTagName("name")).to.have.length(1);

            expect(patientNode.getElementsByTagName("administrativeGenderCode").length).to.be(0);
            expect(patientNode.getElementsByTagName("maritalStatusCode").length).to.be(1); //nullFlavor should be there
            expect(patientNode.getElementsByTagName("religiousAffiliationCode").length).to.be(1);
            expect(patientNode.getElementsByTagName("raceCode").length).to.be(1);
            expect(patientNode.getElementsByTagName("ethnicGroupCode").length).to.be(1);
            //should be able to serialize the resulting model to xml
            var cdaXml = (new XmlSerializer()).serializeToString(actual);
            expect(cdaXml.length > 0).to.be(true);


        });

        it("should not build a recordTarget if patient data is null", function () {
            var document = new DOMParser().parseFromString("<xml />", "text/xml"); //create blank doc
            var patient = null;

            var actual = e.BuildRecordTarget(document, patient, null);

            expect(actual).to.be(null);
        });

        it("should build an author node for a given author", function () {
            var document = new DOMParser().parseFromString("<ClinicalDocument />"); //create blank doc

            var author = personInfo.create();

            author.Identifiers[0].Root = "123";
            author.Identifiers[0].Extension = "456";
            author.StreetAddress = "123 test";
            author.Phone = "123";
            author.AltPhone = "345";
            author.Pager = "678";
            author.Email = "emnail";
            author.FirstName = "Happy";
            author.LastName = "Gilmore";

            var actual = e.BuildAuthor(document, author);

            //should have a timestamp
            expect(actual.getElementsByTagName("time")).to.have.length(1);

            var assignedAuthor = actual.getElementsByTagName('assignedAuthor')[0];

            //next we expect an id, address, phone numbers and email

            expect(assignedAuthor.getElementsByTagName("addr")).to.have.length(1);


            expect(assignedAuthor.getElementsByTagName("telecom")[0].getAttributeNode("use").value).to.be("WP");
            expect(assignedAuthor.getElementsByTagName("telecom")[1].getAttributeNode("use").value).to.be("WP");
            expect(assignedAuthor.getElementsByTagName("telecom")[2].getAttributeNode("use").value).to.be("MC");
            expect(assignedAuthor.getElementsByTagName("telecom")[3].getAttributeNode("value").value).to.contain("mailto:");
            
            //expect().fail((new XMLSerializer()).serializeToString(assignedAuthor));


            var assignedPerson = assignedAuthor.getElementsByTagName("assignedPerson")[0]

            //finally, should have a name node... child nodes are actually tested by cda tools, so that would be redundant here...
            expect(assignedPerson.getElementsByTagName("name")).to.have.length(1);
            
            //TODO: this needs to be expanded to include more than one id
            expect(assignedAuthor.getElementsByTagName("id").length).to.be(1);

            var idNode = assignedAuthor.getElementsByTagName("id")[0];
            expect(idNode.getAttribute("root")).to.be(author.Identifiers[0].Root);
            expect(idNode.getAttribute("extension")).to.be(author.Identifiers[0].Extension);


            //should be able to serialize the resulting model to xml
            var cdaXml = (new XmlSerializer()).serializeToString(actual);
            expect(cdaXml.length > 0).to.be(true);
        });

        it("should not build an author node if author null", function () {
            var document = new DOMParser().parseFromString("<ClinicalDocument />"); //create blank doc
            var author = null;

            var actual = e.BuildAuthor(document, author);

            expect(actual).to.be(null);
        });

        it("should build a custodian node", function () {
            var document = new DOMParser().parseFromString("<ClinicalDocument />"); //create blank doc

            var custodian = OrganizationInfo.create();

            custodian.StreetAddress = "123 test";
            custodian.Phone = "123";
            custodian.AltPhone = "345";
            custodian.Pager = "678";
            custodian.Email = "emnail";
            custodian.Name = "Happy";
            custodian.Identifiers[0].Root = "1234";
            custodian.Identifiers[0].Extension = "56789";

            var actual = e.BuildCustodian(document, custodian);

            var org = actual.getElementsByTagName("assignedCustodian")[0].getElementsByTagName("representedCustodianOrganization")[0];

            //next we expect an id, address, phone numbers and email (and don't forget id)
            expect(org.getElementsByTagName("id")).to.have.length(1);
            expect(org.getElementsByTagName("name")).to.have.length(1);
            expect(org.getElementsByTagName("telecom")).to.have.length(1);
            expect(org.getElementsByTagName("addr")).to.have.length(1);
            expect(org.getElementsByTagName("id")).to.have.length(1);

            //should be able to serialize the resulting model to xml
            var cdaXml = (new XmlSerializer()).serializeToString(actual);
            expect(cdaXml.length > 0).to.be(true);

        });

        it("should build a sendingSite node", function () {
            var document = new DOMParser().parseFromString("<ClinicalDocument />"); //create blank doc

            var organization = OrganizationInfo.create();

            organization.StreetAddress = "123 test";
            organization.Phone = "123";
            organization.AltPhone = "345";
            organization.Pager = "678";
            organization.Email = "email";
            organization.Name = "Happy";
            organization.Identifiers[0].Root = "1234";
            organization.Identifiers[0].Extension = "56789";

            var actual = e.BuildSendingSite(document, organization);

            //next we expect an id, address, phone numbers and email (and don't forget id)
            expect(actual.getElementsByTagName("id")).to.have.length(1);
            expect(actual.getElementsByTagName("name")).to.have.length(1);
            expect(actual.getElementsByTagName("telecom")).to.have.length(1);
            expect(actual.getElementsByTagName("addr")).to.have.length(1);
            expect(actual.getElementsByTagName("id")).to.have.length(1);

            //should be able to serialize the resulting model to xml
            var cdaXml = (new XmlSerializer()).serializeToString(actual);
            expect(cdaXml.length > 0).to.be(true);

        });

        it("should return a null language node if language code is null", function () {
            var document = new DOMParser().parseFromString("<ClinicalDocument />"); //create blank doc

            var actual = e.BuildLanguage(document, null, true);

            expect (actual).to.be(null);

        });

        it("should build a primary languageCommunication node", function () {
            var document = new DOMParser().parseFromString("<ClinicalDocument />"); //create blank doc

            var language = "en";
            var primary = true;

            var actual = e.BuildLanguage(document, language, primary);

            expect(actual.getElementsByTagName("languageCode")[0].getAttributeNode("code").value).to.equal(language);
            expect(actual.getElementsByTagName("preferenceInd")[0].getAttributeNode("value").value).to.equal("true");
            expect(actual.getElementsByTagName("templateId")[0].getAttributeNode("root").value).to.equal("1.3.6.1.4.1.19376.1.5.3.1.2.1");

            //should be able to serialize the resulting model to xml
            var cdaXml = (new XmlSerializer()).serializeToString(actual);
            expect(cdaXml.length > 0).to.be(true);
        });

        it("should build a secondary languageCommunication node", function () {
            var document = new DOMParser().parseFromString("<ClinicalDocument />"); //create blank doc

            var language = "en";
            var primary = false;

            var actual = e.BuildLanguage(document, language, primary);

            expect(actual.getElementsByTagName("languageCode")[0].getAttributeNode("code").value).to.equal(language);
            expect(actual.getElementsByTagName("preferenceInd")[0].getAttributeNode("value").value).to.equal("false");
            expect(actual.getElementsByTagName("templateId")[0].getAttributeNode("root").value).to.equal("1.3.6.1.4.1.19376.1.5.3.1.2.1");

            //should be able to serialize the resulting model to xml
            var cdaXml = (new XmlSerializer()).serializeToString(actual);
            expect(cdaXml.length > 0).to.be(true);

        });
    });
});