describe("When generating a model from cda xml", function () {
    var sampleXml = '', parsedSampleXml,
        DOMParser = require('xmldom').DOMParser,
        CDAtoModelAdapter = require('../CDA/CDAtoModel.js').BuildAll,
        VitalSectionAdapter = require('../CDA/CDAtoModel.js').VitalSectionAdapter,
        GenericSectionAdapter = require('../CDA/CDAtoModel.js').GenericSectionAdapter,
        HeaderAdapter = require('../CDA/CDAtoModel.js').HeaderAdapter,
        medicationSectionModelCreator = require("../Model/MedicationSection.js"),
        genericSectionModelCreator = require("../Model/GenericSection.js"),
        headerSectionModelCreator = require("../Model/HeaderSection.js"),
        personInfoModelCreator = require("../Model/PersonInfo.js"),
        organizationInfoModelCreator = require("../Model/OrganizationInfo.js"),
        patientModelCreator = require("../Model/PersonInfo.js"),
        XmlUtils = require('../utils/xml.js').xml,
        CdaUtils = require('../utils/xml.js').cda,
        assert = require("assert"),
        _ = require("underscore"),
        fileSystem = require('fs'),
        expect = require('expect.js'),
        deleteObservation;

    beforeEach(function () {
        sampleXml = fileSystem.readFileSync('./test/resources/MassHIE_Main_Sample_File.xml', "utf8");
        parsedSampleXml = (new DOMParser()).parseFromString(sampleXml);
    });


    deleteObservation = function (codeDisplayName, organizerNode) {
        var observationNodes = organizerNode.getElementsByTagName('observation');
        var nodeToDelete = _.find(observationNodes, function (n) {
            var codeNode = XmlUtils.FindFirstElement('code', n);
            if (codeNode && codeNode.getAttribute('displayName')) {
                return codeNode.getAttribute('displayName') === codeDisplayName;
            }

            return false;
        });

        if (nodeToDelete) {
            var parentNode = nodeToDelete.parentNode;
            parentNode.removeChild(nodeToDelete);
        }

    };

    it("Should build all entries.", function () {
        var documentModel;
        documentModel = CDAtoModelAdapter(parsedSampleXml);
        assert.equal(!_.isUndefined(documentModel) && !_.isNull(documentModel), true);
        assert.equal(documentModel.AdvanceDirectivesSection.FreeNarrative, "Test Advance Directive text");
    });

    it("Should keep any unrecognized sections intact.", function () {
        var documentModel;
        documentModel = CDAtoModelAdapter(parsedSampleXml);
        assert.equal(!_.isUndefined(documentModel) && !_.isNull(documentModel), true);
        expect(documentModel.OtherSections).to.have.length(2);
    });

    describe("Should build all generic entries.", function () {
        it("Should build medication entry.", function () {
            var structuredBody = XmlUtils.FindFirstElement('ClinicalDocument/component/structuredBody', parsedSampleXml),
                medicationSectionModel, medicationSectionNode, organizerNode;
            medicationSectionNode = CdaUtils.FindSection('2.16.840.1.113883.10.20.22.2.1.1', structuredBody);
            medicationSectionModel = medicationSectionModelCreator.create();
            GenericSectionAdapter(medicationSectionNode, medicationSectionModel);
            assert.equal(medicationSectionModel.FreeNarrative, "Test Medication Text");
        });

        it("Should build generic section entry (based on Advance Directive).", function () {
            var structuredBody = XmlUtils.FindFirstElement('ClinicalDocument/component/structuredBody', parsedSampleXml),
                sectionModel, sectionNode;
            sectionNode = CdaUtils.FindSection('2.16.840.1.113883.10.20.22.2.21.1', structuredBody);
            sectionModel = genericSectionModelCreator.create();
            GenericSectionAdapter(sectionNode, sectionModel);
            assert.equal(sectionModel.FreeNarrative, "Test Advance Directive text");
        });
    });

    describe("Should build vital entry.", function () {
        it("Should find all recognized components (full vital entry filled out).", function () {
            var structuredBody = XmlUtils.FindFirstElement('ClinicalDocument/component/structuredBody', parsedSampleXml),
                vitalSectionModel, vitalSection, organizerNode;
            vitalSection = CdaUtils.FindSection('2.16.840.1.113883.10.20.22.2.4.1', structuredBody);
            vitalSectionModel = VitalSectionAdapter(vitalSection);
            if (organizerNode !== null) {
                assert.equal(vitalSectionModel.FreeNarrative, "Test");
                assert.equal(vitalSectionModel.Vitals.length, 1);
                assert.equal(vitalSectionModel.Vitals[0].Height, 177);
                assert.equal(vitalSectionModel.Vitals[0].HeightUnit, "cm");
                assert.equal(vitalSectionModel.Vitals[0].Weight, 86);
                assert.equal(vitalSectionModel.Vitals[0].WeightUnit, "kg");
                assert.equal(vitalSectionModel.Vitals[0].BMI, 27.45);
                assert.equal(vitalSectionModel.Vitals[0].SystolicBP, 132);
                assert.equal(vitalSectionModel.Vitals[0].DiastolicBP, 82);
                assert.equal(vitalSectionModel.Vitals[0].HeartRate, 80);
                assert.equal(vitalSectionModel.Vitals[0].RespiratoryRate, 15);
                assert.equal(vitalSectionModel.Vitals[0].HeartRhythmValue, 80);
                assert.equal(vitalSectionModel.Vitals[0].HeartRhythmName, "/min");
                assert.equal(vitalSectionModel.Vitals[0].O2Sat, 92);
                assert.equal(vitalSectionModel.Vitals[0].Temperature, 36.5);
                assert.equal(vitalSectionModel.Vitals[0].TemperatureUnit, "Cel");
            } else {
                assert.equal(true, false, "expected to find observation node");
            };
        });

        it("Should find all recognized components (partial vital entry filled out).", function () {
            var structuredBody = XmlUtils.FindFirstElement('ClinicalDocument/component/structuredBody', parsedSampleXml),
                vitalSectionModel, vitalSection, organizerNode;
            vitalSection = CdaUtils.FindSection('2.16.840.1.113883.10.20.22.2.4.1', structuredBody);
            organizerNode = XmlUtils.FindFirstElement('entry/organizer', vitalSection);
            //remove children except height and weight
            deleteObservation('BP Systolic', organizerNode);
            deleteObservation('BP Diastolic', organizerNode);
            deleteObservation('Heart rate', organizerNode);
            deleteObservation('Respiratory rate', organizerNode);
            deleteObservation('Pulse', organizerNode);
            deleteObservation('O2 % BldC Oximetry', organizerNode);
            deleteObservation('Body Temperature', organizerNode);
            deleteObservation('BMI (Body Mass Index)', organizerNode);
            vitalSectionModel = VitalSectionAdapter(vitalSection);

            if (organizerNode !== null) {
                assert.equal(vitalSectionModel.Vitals.length, 1);
                assert.equal(vitalSectionModel.Vitals[0].Height, 177);
                assert.equal(vitalSectionModel.Vitals[0].HeightUnit, "cm");
                assert.equal(vitalSectionModel.Vitals[0].Weight, 86);
                assert.equal(vitalSectionModel.Vitals[0].WeightUnit, "kg");
                assert.equal(vitalSectionModel.Vitals[0].BMI, 0);
                assert.equal(vitalSectionModel.Vitals[0].SystolicBP, 0);
                assert.equal(vitalSectionModel.Vitals[0].DiastolicBP, 0);
                assert.equal(vitalSectionModel.Vitals[0].HeartRate, 0);
                assert.equal(vitalSectionModel.Vitals[0].RespiratoryRate, 0);
                assert.equal(vitalSectionModel.Vitals[0].HeartRhythmValue, 0);
                assert.equal(vitalSectionModel.Vitals[0].HeartRhythmName, "");
                assert.equal(vitalSectionModel.Vitals[0].O2Sat, 0);
                assert.equal(vitalSectionModel.Vitals[0].Temperature, 0);
                assert.equal(vitalSectionModel.Vitals[0].TemperatureUnit, "");
            } else {
                assert.equal(true, false, "expected to find observation node");
            };
        });

        it("Should ignore unrecognized components.", function () {
            //override sampleXml and parsedSampleXml with the specific xml file we want
            var sampleXml = fileSystem.readFileSync('./test/resources/MassHIE_Main_Sample_File.Vitals-BodySurfaceMass.xml', "utf8");
            var parsedSampleXml = (new DOMParser()).parseFromString(sampleXml);
            var structuredBody = XmlUtils.FindFirstElement('ClinicalDocument/component/structuredBody', parsedSampleXml),
                vitalSectionModel, vitalSection, organizerNode;
            vitalSection = CdaUtils.FindSection('2.16.840.1.113883.10.20.22.2.4.1', structuredBody);

            vitalSectionModel = VitalSectionAdapter(vitalSection);

            if (organizerNode !== null) {
                assert.equal(vitalSectionModel.Vitals.length, 1);
                assert.equal(vitalSectionModel.Vitals[0].Height, 177);
                assert.equal(vitalSectionModel.Vitals[0].HeightUnit, "cm");
                assert.equal(vitalSectionModel.Vitals[0].Weight, 0);
                assert.equal(vitalSectionModel.Vitals[0].WeightUnit, "");
                assert.equal(vitalSectionModel.Vitals[0].BMI, 0);
                assert.equal(vitalSectionModel.Vitals[0].SystolicBP, 0);
                assert.equal(vitalSectionModel.Vitals[0].DiastolicBP, 0);
                assert.equal(vitalSectionModel.Vitals[0].HeartRate, 0);
                assert.equal(vitalSectionModel.Vitals[0].RespiratoryRate, 0);
                assert.equal(vitalSectionModel.Vitals[0].HeartRhythmValue, 0);
                assert.equal(vitalSectionModel.Vitals[0].HeartRhythmName, "");
                assert.equal(vitalSectionModel.Vitals[0].O2Sat, 0);
                assert.equal(vitalSectionModel.Vitals[0].Temperature, 0);
                assert.equal(vitalSectionModel.Vitals[0].TemperatureUnit, "");
            } else {
                assert.equal(true, false, "expected to find observation node");
            };
        });
    });

    describe("the Header", function () {
        describe("should locate", function(){
            sampleXml = fileSystem.readFileSync('./test/resources/MassHIE_Main_Sample_File.xml', "utf8");
            parsedSampleXml = (new DOMParser()).parseFromString(sampleXml);
            var rootNode = XmlUtils.FindFirstElement('ClinicalDocument', parsedSampleXml);

            var importer = new HeaderAdapter();


            it ("recordTarget/patientRole", function(){
                var actual = importer.findPatientRoleNode(rootNode);

                expect(actual).to.not.be(null);
            });

            it("recordTarget/patientRole/id", function () {
                var patientRoleNode = rootNode.getElementsByTagName("recordTarget")[0].getElementsByTagName("patientRole")[0];
                var actual = importer.findIdentifiers(patientRoleNode);

                expect(actual).to.not.be(null);
                expect(actual.length).to.be(4);
            });

            it ("recordTarget/patientRole/patient", function(){
                var patientRoleNode =  rootNode.getElementsByTagName("recordTarget")[0].getElementsByTagName("patientRole")[0];
                var actual = importer.findPatientNode(patientRoleNode);

                expect(actual).to.not.be(null);
            });

            it ("authors", function(){
                var actual = importer.findAuthors(rootNode);

                expect(actual).to.have.length(2)
            });

            it ("name using (author/assignedAuthor/assignedPerson/name)", function(){
                var node =  rootNode.getElementsByTagName("author")[0].getElementsByTagName("assignedAuthor")[0].getElementsByTagName("assignedPerson")[0];
                var actual = importer.findPersonNameNode(node);

                expect(actual).to.not.be(null);
            });

            it ("address using (author/assignedAuthor/addr)", function(){
                var node =  rootNode.getElementsByTagName("author")[0].getElementsByTagName("assignedAuthor")[0];
                var actual = importer.findAddressNode(node);

                expect(actual).to.not.be(null);
            })

            it ("telecom using (author/assignedAuthor/telecom)", function(){
                var node =  rootNode.getElementsByTagName("author")[0].getElementsByTagName("assignedAuthor")[0];
                var actual = importer.findTelecomNodes(node);

                expect(actual).to.not.be(null);
            });

            it ("custodian)", function(){
                var actual = importer.findCustodian(rootNode);

                expect(actual).to.not.be(null);
            });

            it ("documentationOf/serviceEvent)", function(){
                var actual = importer.findServiceEvent(rootNode);

                expect(actual).to.not.be(null);
            });
        });

        describe("should match participants and performers", function(){
            var importer = new HeaderAdapter();
            var snippet = "<ClinicalDocument><participant typeCode='IND'><functionCode code='1234'></functionCode><associatedEntity classCode='AGNT'></associatedEntity></participant></ClinicalDocument>";
            var snippet2 = "<ClinicalDocument><performer typeCode='IND'><functionCode code='1234'></functionCode><assignedEntity classCode='AGNT'></assignedEntity></performer></ClinicalDocument>";
            var snippet3 = "<ClinicalDocument><performer><assignedEntity></assignedEntity></performer></ClinicalDocument>";
            var doc = new DOMParser().parseFromString(snippet);
            var doc2 = new DOMParser().parseFromString(snippet2);
            var doc3 = new DOMParser().parseFromString(snippet3);
            var node = doc.getElementsByTagName("participant")[0];
            var nodeWithout = doc3.getElementsByTagName("performer")[0];

            it("based on a matching type code", function(){
                var result = importer.TypeCodeMatches(node, "IND");

                expect(result).to.be.ok();
            });

            it("but ignore non-matching type codes", function(){
                var result = importer.TypeCodeMatches(node, "ABC");

                expect(result).to.not.be.ok();
            });

            it("but ignore nodes without type codes", function(){
                var result = importer.TypeCodeMatches(nodeWithout, "ABC");

                expect(result).to.not.be.ok();
            });

            it("based on a matching class code", function(){
                var result = importer.ClassCodeMatches(node, "associatedEntity", "AGNT");

                expect(result).to.be.ok();
            });

            it("but ignore non-matching class codes", function(){
                var result = importer.ClassCodeMatches(node, "associatedEntity", "ABC");

                expect(result).to.not.be.ok();
            });

            it("but ignore nodes without class codes", function(){
                var result = importer.ClassCodeMatches(nodeWithout, "associatedEntity", "ABC");

                expect(result).to.not.be.ok();
            });

            it("based on a matching function code", function(){
                var result = importer.FunctionCodeMatches(node, "1234");

                expect(result).to.be.ok();
            });

            it("but ignore non-matching function codes", function(){
                var result = importer.FunctionCodeMatches(node, "ABC");

                expect(result).to.not.be.ok();
            });

            it("but ignore nodes without function codes", function(){
                var result = importer.FunctionCodeMatches(nodeWithout, "ABC");

                expect(result).to.not.be.ok();
            });

            it("based on a participant with all of the codes specified", function(){
                var result = importer.findMatchingParticipantNode(doc, "1234", "AGNT", "IND");

                expect(result).to.not.be(null);
            });

            it("based on a participant with some of the codes specified (null means don't care)", function(){
                var result = importer.findMatchingParticipantNode(doc, null, null, "IND");

                expect(result).to.not.be(null);

                result = importer.findMatchingParticipantNode(doc, null, "AGNT", null);

                expect(result).to.not.be(null);

                result = importer.findMatchingParticipantNode(doc, "1234", null, null);

                expect(result).to.not.be(null);
            });

            it("based on a participant with none of the codes specified (then just return the first)", function(){
                var result = importer.findMatchingParticipantNode(doc, null, null, null);

                expect(result).to.not.be(null);
            });

            it("but ignore non-matching participants", function(){
                //abc isn't a match, so no match
                var result = importer.findMatchingParticipantNode(doc, "1234", "AGNT", "ABC");

                expect(result).to.be(null);
            });

            it("based on a performer with all of the codes specified", function(){
                var result = importer.findMatchingPerformerNode(doc2, "1234", "AGNT", "IND");

                expect(result).to.not.be(null);
            });

            it("based on a performer with some of the codes specified (null means don't care)", function(){
                var result = importer.findMatchingPerformerNode(doc2, null, null, "IND");

                expect(result).to.not.be(null);

                result = importer.findMatchingPerformerNode(doc2, null, "AGNT", null);

                expect(result).to.not.be(null);

                result = importer.findMatchingPerformerNode(doc2, "1234", null, null);

                expect(result).to.not.be(null);
            });

            it("based on a performer with none of the codes specified (then just return the first)", function(){
                var result = importer.findMatchingPerformerNode(doc2, null, null, null);

                expect(result).to.not.be(null);
            });

            it("but ignore non-matching performers", function(){
                //abc isn't a match, so no match
                var result = importer.findMatchingPerformerNode(doc2, "1234", "AGNT", "ABC");

                expect(result).to.be(null);
            });

            it("for all known persons (i.e. PCP, Caregiver, care plan manager, etc)", function(){
                var xml = fileSystem.readFileSync('./test/resources/MassHIE_Main_Sample_File.xml', "utf8");
                var doc3 = (new DOMParser()).parseFromString(xml);
                var rootNode = XmlUtils.FindFirstElement('ClinicalDocument', doc3);

                var result = importer.findNextOfKin(rootNode);
                expect(result).to.not.be(null);
                result = null;

                result = importer.findPrimaryCareGiverAtHome(rootNode);
                expect(result).to.not.be(null);
                result = null;

                result = importer.findClinicianToContactWithQuestions(rootNode);
                expect(result).to.not.be(null);
                result = null;

                var serviceEventNode =  rootNode.getElementsByTagName("documentationOf")[0].getElementsByTagName("serviceEvent")[0];

                result = importer.findPrincipalCarePhysician(serviceEventNode);
                expect(result).to.not.be(null);
                result = null;

                result = importer.findCarePlanManager(serviceEventNode);
                expect(result).to.not.be(null);
                result = null;

                result = importer.findPrincipleHealthCareProvider(serviceEventNode);
                expect(result).to.not.be(null);
                result = null;

                result = importer.findPrincipleCareGiver(serviceEventNode);
                expect(result).to.not.be(null);
            });

            it("for all other members of the care team", function () {
                var xml = fileSystem.readFileSync('./test/resources/MassHIE_Main_Sample_File.xml', "utf8");
                var doc3 = (new DOMParser()).parseFromString(xml);
                var rootNode = XmlUtils.FindFirstElement('ClinicalDocument', doc3);
                var serviceEventNode =  rootNode.getElementsByTagName("documentationOf")[0].getElementsByTagName("serviceEvent")[0];

                var result = importer.findOtherMembersOfCareTeam(serviceEventNode);

                //we expect it to ignore the other members of the care team and add the misc one only (???4)
                expect(result).to.have.length(2);
            });
        });

        describe("should import", function(){

            //expect().fail("this should fail 1");
            sampleXml = fileSystem.readFileSync('./test/resources/MassHIE_Main_Sample_File.xml', "utf8");
            parsedSampleXml = (new DOMParser()).parseFromString(sampleXml);
            var rootNode = XmlUtils.FindFirstElement('ClinicalDocument', parsedSampleXml);
            var recordTargetNode =  rootNode.getElementsByTagName("recordTarget")[0];
            var importer = new HeaderAdapter();

             /*
            it("Should ignore null param for header obj", function () {
                assert.equal(HeaderAdapter(null, {}), null);
            });

            it("Should create green model when null passed in for model", function () {
                var headerNode = XmlUtils.FindFirstElement('ClinicalDocument', parsedSampleXml);
                assert.equal(_.isNull(HeaderAdapter(headerNode, null)), false);
                assert.equal(_.isUndefined(HeaderAdapter(headerNode, null)), false);
            });

            it("Should build record target.", function () {
                var headerNode = XmlUtils.FindFirstElement('ClinicalDocument', parsedSampleXml),
                    headerModel = headerSectionModelCreator.create();

                HeaderAdapter(headerNode, headerModel);
                assert.equal(headerModel.Patient.PersonInfo.FirstName, "Isabella");
                assert.equal(headerModel.Patient.PersonInfo.LastName, "Jones");
                assert.equal(headerModel.Patient.PersonInfo.StreetAddress, "1357 Amber Drive");
                assert.equal(headerModel.Patient.PersonInfo.City, "Beaverton");
                assert.equal(headerModel.Patient.PersonInfo.State, "OR");
                assert.equal(headerModel.Patient.PersonInfo.ZipCode, "97867");
                assert.equal(headerModel.Patient.PersonInfo.Country, "US");
                assert.equal(headerModel.Patient.PersonInfo.Phone, "(816)276-6909");
                assert.equal(headerModel.Patient.PersonInfo.Email, "my.email@address.com");
            });
            */

            it("a name node to PersonInfo", function(){
                //we'll use the name in the author node
                var nameNode = rootNode.getElementsByTagName("author")[0].getElementsByTagName("assignedAuthor")[0].getElementsByTagName("name")[0];
                var personInfo = personInfoModelCreator.create();

                importer.adaptPersonName(nameNode, personInfo);

                expect(personInfo.FirstName).to.equal("Henry");
                expect(personInfo.LastName).to.equal("Seven");
            });

            it("an address to PersonInfo", function(){
                var addrNode = rootNode.getElementsByTagName("author")[0].getElementsByTagName("assignedAuthor")[0].getElementsByTagName("addr")[0];
                var personInfo = personInfoModelCreator.create();

                importer.adaptPersonAddress(addrNode, personInfo);

                expect(personInfo.StreetAddress).to.equal("1002 Healthcare Drive");
                expect(personInfo.City).to.equal("Portland");
                expect(personInfo.State).to.equal("OR");
                expect(personInfo.ZipCode).to.equal("99123");
                expect(personInfo.Country).to.equal("US");
            });

            it("telcom addresses to PersonInfo", function(){
                var telecomNodes = rootNode.getElementsByTagName("author")[0].getElementsByTagName("assignedAuthor")[0].getElementsByTagName("telecom");
                var personInfo = personInfoModelCreator.create();

                importer.adaptPersonTelecom(telecomNodes, personInfo);

                expect(personInfo.Phone).to.equal("555-555-1001");
                expect(personInfo.Pager).to.equal("555-555-1003");
                expect(personInfo.Email).to.equal("henry@gmail.com");
            });

            it("personNodes (such as assignedPerson) to PersonInfo", function(){
                var authorNode = rootNode.getElementsByTagName("author")[0].getElementsByTagName("assignedAuthor")[0];
                var personInfo = personInfoModelCreator.create();

                importer.adaptPersonNode(authorNode, "assignedPerson", personInfo);

                //I expect that it called personName, address and telecom
                expect(personInfo.Phone).to.equal("555-555-1001");
                expect(personInfo.StreetAddress).to.equal("1002 Healthcare Drive");
                expect(personInfo.FirstName).to.equal("Henry");
            });

            it ("multiple authors", function(){
                //getElementsByTagName is not a good choice for this operation because it's a deep check
//                var authorNodes = rootNode.getElementsByTagName("author");
                var authorNodes = _.filter(rootNode.childNodes, function(child){return child.nodeName == "author";});

                var assignedAuthorNodes = new Array();

                _.each(authorNodes, function (authorNode) {
                    assignedAuthorNodes.push(authorNode.getElementsByTagName("assignedAuthor")[0]);
                });

                var authors = new Array();

                importer.adaptAuthors(assignedAuthorNodes, authors);

                expect(authors).to.have.length(2);

            });

            it ("a single author to a PersonInfo", function(){
                //use the first author we find
                var assignedAuthor = rootNode.getElementsByTagName("author")[0].getElementsByTagName("assignedAuthor")[0];
                var assignedAuthors = [assignedAuthor];
                var authors = new Array();

                importer.adaptAuthors(assignedAuthors, authors);

                expect(authors).to.have.length(1);
            });

            it ("no authors", function(){

                var assignedAuthors = new Array();
                var authors = new Array();

                //null
                importer.adaptAuthors(null, authors);

                expect(authors).to.have.length(0);

                //or an empty array
                importer.adaptAuthors(assignedAuthors, authors);

                expect(authors).to.have.length(0);
            });

            it("patient demographics into a PersonInfo", function(){
                var patientNode = recordTargetNode.getElementsByTagName("patientRole")[0].getElementsByTagName("patient")[0];
                var patientModel = patientModelCreator.create();

                importer.adaptPatientDemographics(patientNode, patientModel);
                expect(patientModel.BirthTime.getFullYear()).to.equal(2005);
                expect(patientModel.BirthTime.getMonth() + 1).to.equal(5);
                expect(patientModel.BirthTime.getDate()).to.equal(1);
                expect(patientModel.GenderCode).to.equal("F");
                expect(patientModel.RaceCode).to.equal("1966-1");
                expect(patientModel.EthnicityCode).to.equal("2186-5");
                expect(patientModel.ReligionCode).to.equal("1013");
                expect(patientModel.MaritalStatusCode).to.equal("M");
                expect(patientModel.PrimaryLanguageCode).to.equal("en");
                expect(patientModel.OtherLanguageCode).to.equal("el");
            });

            it("patient id's into identifiers", function () {
                var patientNode = recordTargetNode.getElementsByTagName("patientRole")[0];                
                var iids = importer.buildIdentifiers(patientNode);
                var roots = '"2.16.840.1.113883.19.5.99999.2,2.16.840.1.113883.4.1';
                var extensions = '998991,111-00-2330,111-00-2330,111-00-2330';

                expect(iids).not.to.be(null);
                expect(iids.length).to.be(4);
                _.each(iids, function (iid) {                    
                    expect(extensions.indexOf(iid.Extension)).not.to.be(-1);
                    expect(roots.indexOf(iid.Root)).not.to.be(-1);
                });
            });

            it("no patient demographics if it is null", function(){
                var patientModel = null;
                importer.adaptPatientDemographics(null, patientModel);

                //should not have even touched the model, so no errors if it's null
                expect(patientModel).to.be(null);


            });

            it("guardian into a PersonInfo", function(){
                var guardianNode = recordTargetNode.getElementsByTagName("patientRole")[0].getElementsByTagName("patient")[0].getElementsByTagName("guardian")[0];
                var personInfo = personInfoModelCreator.create();

                importer.adaptGuardian(guardianNode, personInfo);

                //don't need to test all the details... we test personInfo separately...
                expect(personInfo.FirstName).to.equal("Ralph");

            });

            it("no guardian if it is null", function(){
                var guardianNode = null;
                var personInfo = null;

                importer.adaptGuardian(guardianNode, personInfo);

                //don't need to test all the details... we test personInfo separately...
                expect(personInfo).to.be(null);

            });

            it("custodian into an OrganizationInfo", function(){
                var custodianNode = rootNode.getElementsByTagName("custodian")[0].getElementsByTagName("assignedCustodian")[0].getElementsByTagName("representedCustodianOrganization")[0];
                var organizationInfo = organizationInfoModelCreator.create();

                importer.adaptCustodian(custodianNode, organizationInfo);

                //don't need to test all the details... we test personInfo separately...
                expect(organizationInfo.Name).to.equal("Community Health and Hospitals");
                expect(organizationInfo.StreetAddress).to.equal("1002 Healthcare Drive");
                expect(organizationInfo.Phone).to.equal("555-555-1002");
            });

            it("no custodian if it is null", function(){
                var custodianNode = null;
                var organizationInfo = null;

                importer.adaptCustodian(custodianNode, organizationInfo);

                //don't need to test all the details... we test personInfo separately...
                expect(organizationInfo).to.be(null);

            });

            it("participants into an PersonInfo", function(){
                //just get the first one...
                var participantNode = rootNode.getElementsByTagName("participant")[0];
                var personInfo = personInfoModelCreator.create();

                importer.adaptParticipant(participantNode, personInfo);

                //don't need to test all the details... we test personInfo separately...
                expect(personInfo.FirstName).to.equal("Martha");
            });

            it("no participants if none exist", function(){
                var participantNode = null;
                var personInfo = null;

                importer.adaptParticipant(participantNode, personInfo);

                //don't need to test all the details... we test personInfo separately...
                expect(personInfo).to.be(null);

            });

            /*
            it("next of kin into an PersonInfo", function(){
                //just get the first one...
                var participantNode = rootNode.getElementsByTagName("participant")[0];
                var personInfo = personInfoModelCreator.create();

                importer.adaptParticipant(participantNode, personInfo);

                //don't need to test all the details... we test personInfo separately...
                expect(personInfo.FirstName).to.equal("Martha");
            });

            it("no next of kin if none exist", function(){
                var participantNode = null;
                var personInfo = null;

                importer.adaptParticipant(participantNode, personInfo);

                //don't need to test all the details... we test personInfo separately...
                expect(personInfo).to.be(null);

            });
            */
            it("performers into an PersonInfo", function(){
                //just get the first one...
                var performerNode =  rootNode.getElementsByTagName("documentationOf")[0].getElementsByTagName("serviceEvent")[0].getElementsByTagName("performer")[0];
                var personInfo = personInfoModelCreator.create();

                importer.adaptPerformer(performerNode, personInfo);

                //don't need to test all the details... we test personInfo separately...
                expect(personInfo.FirstName).to.equal("Henry");
            });

            it("no performers if none exist", function(){
                var performerNode = null;
                var personInfo = null;

                importer.adaptPerformer(performerNode, personInfo);

                //don't need to test all the details... we test personInfo separately...
                expect(personInfo).to.be(null);

            });
            /*
            it("should adapt a person's name (for example, the author's)", function () {
                var authorNode = rootNode.getElementsByTagName()
                    var headerModel = headerSectionModelCreator.create();
                headerModel.Authors = [];
                HeaderAdapter(rootNode, headerModel);
                assert.equal(rootNode.Authors[0].FirstName, "Henry");
                assert.equal(rootNode.Authors[0].LastName, "Seven");
                assert.equal(rootNode.Authors[0].StreetAddress, "1002 Healthcare Drive ");
                assert.equal(rootNode.Authors[0].City, "Portland");
                assert.equal(rootNode.Authors[0].State, "OR");
                assert.equal(rootNode.Authors[0].ZipCode, "99123");
                assert.equal(rootNode.Authors[0].Country, "US");
                assert.equal(rootNode.Authors[0].Phone, "555-555-1002");
                assert.equal(rootNode.Authors[0].Email, "");
            });

            it("Should build custodian.", function () {
                var headerNode = XmlUtils.FindFirstElement('ClinicalDocument', parsedSampleXml),
                    headerModel = headerSectionModelCreator.create();
                headerModel.Authors = [];
                HeaderAdapter(headerNode, headerModel);
                assert.equal(headerModel.Custodian.Name, "Community Health and Hospitals");
                assert.equal(headerModel.Custodian.StreetAddress, "1002 Healthcare Drive ");
                assert.equal(headerModel.Custodian.City, "Portland");
                assert.equal(headerModel.Custodian.State, "OR");
                assert.equal(headerModel.Custodian.ZipCode, "99123");
                assert.equal(headerModel.Custodian.Country, "US");
                assert.equal(headerModel.Custodian.Phone, " 555-555-1002");
            });
            */


            it("an entire document", function () {
                var headerModel = headerSectionModelCreator.create();
                headerModel.Authors = [];

                importer.ImportAll(rootNode, headerModel);

                //expect a patient to be there
                expect(headerModel.Patient.PersonInfo.FirstName).to.not.equal("");

                //expect a guardian to be there
                expect(headerModel.Guardian.FirstName).to.not.equal("");

                //expect next of kin to be there
                expect(headerModel.NextOfKin.FirstName).to.not.equal("");

                //expect PrimaryCareGiverAtHome to be there
                expect(headerModel.PrimaryCareGiverAtHome.FirstName).to.not.equal("");

                //expect ClinicianToContactWithQuestions to be there
                expect(headerModel.ClinicianToContactWithQuestions.FirstName).to.not.equal("");

                //expect PrincipleCarePhysician to be there
                expect(headerModel.PrincipleCarePhysician.FirstName).to.not.equal("");

                //expect CarePlanManager to be there
                expect(headerModel.CarePlanManager.FirstName).to.not.equal("");

                //expect PrincipleHealthCareProvider to be there
                expect(headerModel.PrincipleHealthCareProvider.FirstName).to.not.equal("");

                //expect PrincipleCareGiver to be there
                expect(headerModel.PrincipleCareGiver.FirstName).to.not.equal("");

                //expect PrincipleHealthCareProvider to be there
                expect(headerModel.OtherMembersOfCareTeam).to.have.length(2);

                //expect Authors to be there
                expect(headerModel.Authors).to.have.length(2);

                //expect PrincipleHealthCareProvider to be there
                expect(headerModel.Custodian.Name).to.not.equal("");
            });
        });
   });
});