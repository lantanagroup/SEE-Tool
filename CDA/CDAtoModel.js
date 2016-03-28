var _ = require("underscore"),
    documentCreator = require("../Model/Document.js"),
    DOMParser = require('xmldom').DOMParser,
    XmlSerializer = require('xmldom').XMLSerializer,
    vitalSectionModelCreator = require("../Model/VitalSection.js"),
    vitalEntryModelCreator = require("../Model/VitalEntry.js"),
    problemSectionModelCreator = require("../Model/ProblemSection.js"),
    functionalStatusModelCreateor = require("../Model/FunctionalStatusSection.js"),
    medicationSectionModelCreator = require("../Model/MedicationSection.js"),
    genericSectionModelCreator = require("../Model/GenericSection.js"),
    personInfoModelCreator = require("../Model/PersonInfo.js"),
    headerModelCreator = require("../Model/HeaderSection.js"),
    iidModelCreator = require("../Model/InstanceIdentifier.js"),
    XmlUtils = require('../utils/xml.js').xml,
    CdaUtils = require('../utils/xml.js').cda,
    DocumentSectionToSectionCodeMap = require("./Constants.js").CONSTANTS.MAP.DocumentSectionToSectionCode,
    CONSTANTS = require('./Constants.js').CONSTANTS,
    SectionCode = require("../Model/Enum/enum.js").SectionCode;

var parseCodeAndValue = function (codeNode, valueNode, vitalEntryModel) {
    switch (codeNode.getAttribute('code')) {
        case CONSTANTS.LOINC.HEIGHT:
            vitalEntryModel.Height = parseFloat(valueNode.getAttribute("value"));
            vitalEntryModel.HeightUnit = valueNode.getAttribute("unit");
            break;
        case CONSTANTS.LOINC.WEIGHT_MEASURED:
            vitalEntryModel.Weight = parseFloat(valueNode.getAttribute("value"));
            vitalEntryModel.WeightUnit = valueNode.getAttribute("unit");
            break;
        case CONSTANTS.LOINC.BODY_WEIGHT:
            vitalEntryModel.Weight = parseFloat(valueNode.getAttribute("value"));
            vitalEntryModel.WeightUnit = valueNode.getAttribute("unit");
            break;
        case CONSTANTS.LOINC.BP_SYSTOLIC:
            vitalEntryModel.SystolicBP = valueNode.getAttribute("value");
            break;
        case CONSTANTS.LOINC.BP_DIASTOLIC:
            vitalEntryModel.DiastolicBP = valueNode.getAttribute("value");
            break;
        case CONSTANTS.LOINC.HEART_RATE:
            vitalEntryModel.HeartRate = valueNode.getAttribute("value");
            break;
        case CONSTANTS.LOINC.RESPIRATORY_RATE:
            vitalEntryModel.RespiratoryRate = valueNode.getAttribute("value");
            break;
        case CONSTANTS.LOINC.PULSE:
            vitalEntryModel.HeartRhythmValue = valueNode.getAttribute("value");
            vitalEntryModel.HeartRhythmName = valueNode.getAttribute("unit");
            break;
        case CONSTANTS.LOINC.O2:
            vitalEntryModel.O2Sat = valueNode.getAttribute("value");
            break;
        case CONSTANTS.LOINC.TEMPERATURE:
            vitalEntryModel.Temperature = valueNode.getAttribute("value");
            vitalEntryModel.TemperatureUnit = valueNode.getAttribute("unit");
            break;
        case CONSTANTS.LOINC.BMI:
            vitalEntryModel.BMI = valueNode.getAttribute("value");
            break;

    }
};

var parseObservation = function (observationNode, vitalEntryModel) {
    var code = XmlUtils.FindFirstElement('code', observationNode);
    var value = XmlUtils.FindFirstElement('value', observationNode);
    if (value && value.hasAttribute('value')) {
        if (code && code.hasAttribute('codeSystem') && code.hasAttribute('code')) {
            if (code.getAttribute('codeSystem') === CONSTANTS.LOINC.CODESYSTEM) {
                parseCodeAndValue(code, value, vitalEntryModel);
            }
        }
    }
};

var getNarrativeText = function (sectionNode) {
    var textNode = XmlUtils.FindFirstElement('text', sectionNode);
    
    if (textNode) {
        //TODO: find a better way to get rid of text tags, perhaps an innerXML or something
        return (new XmlSerializer()).serializeToString(textNode).replace("<text>", "").replace("</text>", "");
    }

    return "";
};

//we expect to be sent the /cda:ClinicalDocument/cda:component/cda:structuredBody/cda:component/cda:section
exports.VitalSectionAdapter = function (vitalSectionNode) {
    var vitalSectionModel = vitalSectionModelCreator.create(),
        vitalEntryModel, organizerNode, componentNode, observationNodes, observationNode;

    if (!vitalSectionNode) {
        return null;
    }
    //copy section.text
    vitalSectionModel.FreeNarrative = getNarrativeText(vitalSectionNode);
    //iterate through vital section and parse the components we recognize    
    _.each(vitalSectionNode.childNodes, function (node) {
        if (node.nodeName === "entry") {
            organizerNode = node.getElementsByTagName("organizer")[0];
            if (organizerNode) {
                vitalEntryModel = vitalEntryModelCreator.create();
                var effectiveTimeNode = organizerNode.getElementsByTagName('effectiveTime')[0];
                if (effectiveTimeNode) {
                    var time = effectiveTimeNode.getAttribute("value");

                    if (!time){
                        var low = effectiveTimeNode.getElementsByTagName("low")[0];
                        
                        if(low)
                            time = low.getAttribute("value");
                    }

                    if (time)
                        vitalEntryModel.DateRecorded = CdaUtils.fromGTSString(time);
                }
                var observationNodes = organizerNode.getElementsByTagName('observation');
                if (observationNodes && observationNodes.length) {
                    _.each(observationNodes, function (observationNode) {
                        parseObservation(observationNode, vitalEntryModel);
                    });
                }
                vitalSectionModel.Vitals.push(vitalEntryModel);
            }
        }
    });
        
    return vitalSectionModel;
};

exports.GenericSectionAdapter = function (sectionNode, sectionModel) {
    if (!sectionModel) {
        sectionModel = genericSectionModelCreator.create();
    }

    sectionModel.FreeNarrative = getNarrativeText(sectionNode);

    return sectionModel;
};

exports.HeaderAdapter = function () {
    var self = this;

    self.adaptPersonName = function(nameNode, personInfoModel) {
        var givenNode, familyNode, suffixNode;
        if (nameNode) {
            givenNode = nameNode.getElementsByTagName('given')[0];
            if (givenNode && givenNode.childNodes[0]) {
                personInfoModel.FirstName = givenNode.childNodes[0].nodeValue;
            }
            familyNode = nameNode.getElementsByTagName('family')[0];
            if (familyNode && familyNode.childNodes[0]) {
                personInfoModel.LastName = familyNode.childNodes[0].nodeValue;
            }
            suffixNode = nameNode.getElementsByTagName('suffix')[0];
            if (suffixNode && suffixNode.childNodes[0]) {
                personInfoModel.Suffix = suffixNode.childNodes[0].nodeValue;
            }
        }
    };

    self.adaptPatientDemographics = function(patientNode, patientModel) {
        var birthTimeNode, genderNode, raceNode, ethnicityNode, religiousAffiliationNode, maritalStatusNode;
        if (patientNode) {

            birthTimeNode = patientNode.getElementsByTagName('birthTime')[0];
            if (birthTimeNode && birthTimeNode.getAttributeNode("value")) {
                patientModel.BirthTime = CdaUtils.fromGTSString(birthTimeNode.getAttributeNode("value").value);
            }

            genderNode = patientNode.getElementsByTagName('administrativeGenderCode')[0];
            if (genderNode && genderNode.getAttributeNode("code")) {
                patientModel.GenderCode = genderNode.getAttributeNode("code").value;
            }

            raceNode = patientNode.getElementsByTagName('raceCode')[0];
            if (raceNode && raceNode.getAttributeNode("code")) {
                patientModel.RaceCode = raceNode.getAttributeNode("code").value;
            }

            ethnicityNode = patientNode.getElementsByTagName('ethnicGroupCode')[0];
            if (ethnicityNode && ethnicityNode.getAttributeNode("code")) {
                patientModel.EthnicityCode = ethnicityNode.getAttributeNode("code").value;
            }

            religiousAffiliationNode = patientNode.getElementsByTagName('religiousAffiliationCode')[0];
            if (religiousAffiliationNode && religiousAffiliationNode.getAttributeNode("code")) {
                patientModel.ReligionCode = religiousAffiliationNode.getAttributeNode("code").value;
            }

            maritalStatusNode = patientNode.getElementsByTagName('maritalStatusCode')[0];
            if (religiousAffiliationNode && maritalStatusNode.getAttributeNode("code")) {
                patientModel.MaritalStatusCode = maritalStatusNode.getAttributeNode("code").value;
            }

            var languages =  patientNode.getElementsByTagName('languageCommunication');

            if (languages.length > 0)
            {

                for(var i = 0; i< languages.length;i++)
                {
                    var codeNode =  languages[i].getElementsByTagName('languageCode')[0];

                    if (codeNode && codeNode.getAttributeNode("code"))
                    {
                        var code = codeNode.getAttributeNode("code").value;

                        var isPreferred = false;

                        var preferenceNode =  languages[i].getElementsByTagName("preferenceInd")[0];
                        if (preferenceNode && preferenceNode.getAttributeNode("value"))
                        {
                            var preference =  preferenceNode.getAttributeNode("value").value;
                            if (preference.toLowerCase() == "true")
                                isPreferred = true;
                        }

                        //if this is the preferred language or the only language, then it's the primary language
                        if (isPreferred || languages.length == 1)
                        {
                            patientModel.PrimaryLanguageCode = code;
                        }
                        //if this is not the preferred language, and they speak more than one, then this is the "other language"
                        else if (languages.length > 1)
                        {
                            patientModel.OtherLanguageCode = code;
                        }
                    }
                }

            }
        }
    };

    self.findPatientRoleNode = function(headerNode){
        var recordTargetNode = headerNode.getElementsByTagName('recordTarget')[0];

        if (recordTargetNode) {
            return recordTargetNode.getElementsByTagName('patientRole')[0];
        }
    };

    self.findPatientNode = function(patientRoleNode){
        return patientRoleNode.getElementsByTagName('patient')[0];

    };

    self.findIdentifiers = function (parentNode) {
        var ids = [];
        _.each(parentNode.childNodes, function (node) {
            if (node.nodeName === "id") {
                ids.push(node);
            }
        });

        return ids;
    };

    self.findAuthors = function(headerNode) {

        var authorNodes = _.filter(headerNode.childNodes, function(child){return child.nodeName == "author";});

        //var authorNodes = headerNode.getElementsByTagName("author");
        var assignedAuthorNodes = new Array();


        _.each(authorNodes, function (authorNode) {
            assignedAuthorNodes.push(authorNode.getElementsByTagName("assignedAuthor")[0]);
        });

        return assignedAuthorNodes;
    };

    self.buildIdentifiers = function (parentNode) {
        var isValidiid = function (iid) {
            var isValid = true;

            isValid = !_.isUndefined(iid.Root) && !_.isUndefined(iid.Extension);
            if (_.isString(iid.Root)) {
                isValid = !_.isEmpty(iid.Root);
            } else {
                isValid = false;
            }

            if (_.isString(iid.Extension)) {
                isValid = !_.isEmpty(iid.Extension);
            }
            else {
                isValid = false;
            }

            return isValid;
        };

        var idNodes = self.findIdentifiers(parentNode);
        var idArray = [];
        _.each(idNodes, function (node) {
            var newiid = iidModelCreator.create();
            newiid.Root = node.getAttribute("root");
            newiid.Extension = node.getAttribute("extension");
            if (isValidiid(newiid)) {
                idArray.push(newiid);
            } 
        });

        return idArray;
    };

    self.adaptPersonAddress = function (addrNode, personInfoModel) {
        if (addrNode){
            _.each(addrNode.childNodes, function(node) {
                if (node.childNodes && node.childNodes[0] && node.childNodes[0].nodeValue) {
                    switch (node.nodeName){
                        case "streetAddressLine":
                            personInfoModel.StreetAddress = node.childNodes[0].nodeValue;
                            break;
                        case "city":
                            personInfoModel.City = node.childNodes[0].nodeValue;
                            break;
                        case "state":
                            personInfoModel.State = node.childNodes[0].nodeValue;
                            break;
                        case "postalCode":
                            personInfoModel.ZipCode = node.childNodes[0].nodeValue;
                            break;
                        case "country":
                            personInfoModel.Country = node.childNodes[0].nodeValue;
                            break;
                    }
                }
            });
        }
    };

    self.adaptPersonTelecom = function(teleNodes, personInfoModel) {
        var parseTelecomElement = function (telecomNode, personInfoModel) {
            var val;
            if (telecomNode.getAttribute('use') === 'HP') {
                personInfoModel.Phone = telecomNode.getAttribute('value');
                if (personInfoModel.Phone) {
                    personInfoModel.Phone = personInfoModel.Phone.replace(/tel:/g, '');
                }
            }
            else if (telecomNode.getAttribute('use') === 'WP') {
                personInfoModel.Phone = telecomNode.getAttribute('value');
                if (personInfoModel.Phone) {
                    personInfoModel.Phone = personInfoModel.Phone.replace(/tel:/g, '');
                }
            }
            else if (telecomNode.getAttribute('use') === 'MC') {
                personInfoModel.Pager = telecomNode.getAttribute('value');
                if (personInfoModel.Pager) {
                    personInfoModel.Pager = personInfoModel.Pager.replace(/tel:/g, '');
                }
            }
            else if (telecomNode.getAttribute && telecomNode.getAttribute('value')) {
                val = telecomNode.getAttribute('value');
                if (val.indexOf('mailto:') >= 0) {
                    personInfoModel.Email = val.replace(/mailto:/g, '');
                }
            }
        };

        _.each(teleNodes, function (node)  {
            parseTelecomElement(node, personInfoModel);
        });
    };

    self.findPersonNameNode = function(personNode){
        var nameNode;

        if (personNode){
            nameNode = personNode.getElementsByTagName('name')[0];
            if (nameNode) {
                return nameNode;
            }
        }

        return null;
    };

    self.findAddressNode = function(parentNode) {
        var addrNode, nodes;

        if (parentNode) {
            nodes = parentNode.getElementsByTagName('addr');
            //addr node with "HP" use
            addrNode = _.find(nodes, function(node){
                var use = node.getAttribute('use');
                if (use) {
                    return use.toLowerCase() === 'hp';
                }
                return false;
            });

            if (!addrNode && nodes.length) {
                addrNode = nodes[0];
            }
        }

        return addrNode;
    };

    self.findTelecomNodes = function(parentNode) {
        return parentNode.getElementsByTagName('telecom');
    };

    self.adaptAuthors = function (assignedAuthorNodes, authorsArray) {
        if (assignedAuthorNodes == null)
            return;

        for (var i = 0; i < assignedAuthorNodes.length; i++)
        {
            var assignedAuthorNode =  assignedAuthorNodes[i];
        //_.each(assignedAuthorNodes, function (assignedAuthorNode) {

            var author = personInfoModelCreator.create();

            //the author node has an assigned person and in there is the person's name
            self.adaptPersonNode(assignedAuthorNode, "assignedPerson", author);

            //adaptPersonName(findPersonNameNode(assignedAuthorNode.getElementsByTagName("assignedPerson")[0]), author);
            //adaptPersonAddress(findAddressNode(assignedAuthorNode), author);
            //adaptPersonTelecom(findTelecomNodes(assignedAuthorNode), author);
            authorsArray.push(author);
        //});
        }
    };

    //you need to give it the node (guardian, author, etc) and a valid instance of PersonInfo
    //assignedPersonNode name lets you specify where you expect the name to be... those are named differently
    self.adaptPersonNode = function(parentNode, assignedPersonNodeName, personInfo){
        if (parentNode && personInfo && assignedPersonNodeName != "")
        {            
            var personNodeParent = parentNode.getElementsByTagName(assignedPersonNodeName)[0];

            if (personNodeParent == null)
            {
                console.log(assignedPersonNodeName + " was not found");
                return;
            }
            
            self.adaptPersonName(self.findPersonNameNode(personNodeParent), personInfo);
            self.adaptPersonAddress(self.findAddressNode(parentNode), personInfo);
            self.adaptPersonTelecom(self.findTelecomNodes(parentNode), personInfo);
            
            var ids = self.buildIdentifiers(personNodeParent.parentNode);
            if (ids && ids.length) {
                personInfo.Identifiers = ids;
            }
        }

    };

    self.adaptGuardian = function (guardianNode, personInfo) {
        //the guardian node has an assignedGuardian and in there is the person's name
        self.adaptPersonNode(guardianNode, "guardianPerson", personInfo) ;
    }

    self.findCustodian = function (headerNode) {
        var custodianNode = headerNode.getElementsByTagName("custodian")[0], assignedCustodianNode;
        if (custodianNode){
            assignedCustodianNode = custodianNode.getElementsByTagName("assignedCustodian")[0];
            if (assignedCustodianNode) {
                return assignedCustodianNode.getElementsByTagName('representedCustodianOrganization')[0];
            }
        }

        return null;
    };

    self.adaptCustodian = function (custodianNode, custodianModel) {
        if (custodianNode)
        {
            var nameNode = custodianNode.getElementsByTagName('name')[0], addrNode = custodianNode.getElementsByTagName('addr')[0],
                teleNode = custodianNode.getElementsByTagName('telecom');
            if (nameNode && nameNode.childNodes && nameNode.childNodes.length){
                custodianModel.Name = nameNode.childNodes[0].nodeValue;
            }

            if (addrNode) {
                self.adaptPersonAddress(addrNode, custodianModel);
            }

            if (teleNode) {
                self.adaptPersonTelecom(teleNode, custodianModel);
            }
        }
    };

    var adaptKnownPerson = function (node, personInfo, findFunction, adaptFunction){
        var result = findFunction(node);

        adaptFunction(result, personInfo)
    };

    self.findNextOfKin = function(headerNode){
        return self.findMatchingParticipantNode(headerNode, null, "NOK", "IND");
    };

    self.findPrimaryCareGiverAtHome = function(headerNode){
        return self.findMatchingParticipantNode(headerNode, "407543004", "CAREGIVER", "IND");
    };

    self.findPrincipalCarePhysician = function(headerNode){
        return self.findMatchingPerformerNode(headerNode, "PCP", null, "PRF");
    };

    self.findClinicianToContactWithQuestions = function(headerNode){
        return self.findMatchingParticipantNode(headerNode, null, "ASSIGNED", "CALLBCK");
    };

    self.findCarePlanManager = function(headerNode){
        return self.findMatchingPerformerNode(headerNode, "???1", null, "PRF");
    };

    self.findPrincipleHealthCareProvider = function(headerNode){
        return self.findMatchingPerformerNode(headerNode, "???2", null, "PRF");
    };

    self.findPrincipleCareGiver = function(headerNode){
        return self.findMatchingPerformerNode(headerNode, "???3", null, "PRF");
    };

    self.findOtherMembersOfCareTeam = function(serviceEventNode){
        var members = new Array();

        if(serviceEventNode)
        {
            var knownPerformer1 = serializeXmlNode(self.findPrincipalCarePhysician(serviceEventNode));
            var knownPerformer2 = serializeXmlNode(self.findCarePlanManager(serviceEventNode));
            var knownPerformer3 = serializeXmlNode(self.findPrincipleHealthCareProvider(serviceEventNode));
            var knownPerformer4 = serializeXmlNode(self.findPrincipleCareGiver(serviceEventNode));

            var allPerformers = serviceEventNode.getElementsByTagName("performer");

            for (var i = 0; i < allPerformers.length; i++)
            {
                var performer = allPerformers[i];
                var performerXml = serializeXmlNode(performer);

                if (performerXml != knownPerformer1 && performerXml != knownPerformer2
                    && performerXml != knownPerformer3 && performerXml != knownPerformer4)
                {
                    members.push(performer);
                }
            }
        }

        return members;
    };

    var serializeXmlNode = function(xmlNode) {
        if (xmlNode == null){
            return null;
        }

        return (new XmlSerializer()).serializeToString(xmlNode);
    }

    self.adaptOtherMembersOfCareTeam = function (foundMemberPerformers, members) {
        for (var i = 0; i < foundMemberPerformers.length; i++)
        {
            var newMember = personInfoModelCreator.create();
            self.adaptPerformer(foundMemberPerformers[i], newMember);
            members.push(newMember);
        }

        //self.adaptPerformer(carePlanManagerNode, personInfo);
    };

    self.findMatchingPerformerNode = function(serviceEventNode, functionCodeDesired, classCodeDesired, typeCodeDesired){
        var nodes = serviceEventNode.getElementsByTagName("performer");
        var typeCodeMatch = true;
        var functionCodeMatch = true;
        var classCodeMatch = true;

        for(var i = 0; i < nodes.length; i++){
            var node = nodes[i];

            if (typeCodeDesired)
                typeCodeMatch = self.TypeCodeMatches(node, typeCodeDesired);

            if (functionCodeDesired)
                functionCodeMatch = self.FunctionCodeMatches(node, functionCodeDesired);

            if (classCodeDesired)
                classCodeMatch = self.ClassCodeMatches(node, "assignedEntity", classCodeDesired);

            if (functionCodeMatch && classCodeMatch && typeCodeMatch)
            {
                return node;
            }
        }

        return null;
    };

    self.findMatchingParticipantNode = function(headerNode, functionCodeDesired, classCodeDesired, typeCodeDesired){
        var nodes = headerNode.getElementsByTagName("participant");
        var typeCodeMatch = true;
        var functionCodeMatch = true;
        var classCodeMatch = true;

        for(var i = 0; i < nodes.length; i++){
            var node = nodes[i];

            if (typeCodeDesired) {
                typeCodeMatch = self.TypeCodeMatches(node, typeCodeDesired);
            }

            if (functionCodeDesired) {
                functionCodeMatch = self.FunctionCodeMatches(node, functionCodeDesired);
            }

            if (classCodeDesired) {
                classCodeMatch = self.ClassCodeMatches(node, "associatedEntity", classCodeDesired);
            }

            if (functionCodeMatch && classCodeMatch && typeCodeMatch)
            {
                return node;
            }
        }

        return null;

    };

    self.FunctionCodeMatches = function (node, functionCodeToMatch){
        if(functionCodeToMatch == null)
            return true;

        if (functionCodeToMatch != null){
            var functionCodeNode = node.getElementsByTagName("functionCode")[0];

            if (functionCodeNode && functionCodeNode.getAttributeNode("code")){
                var functionCodeFound = functionCodeNode.getAttributeNode("code").value;

                return (functionCodeFound == functionCodeToMatch);
            }
        }

        return false;
    };

    self.ClassCodeMatches = function (node, entityName, classCodeToMatch){
        if(classCodeToMatch == null)
            return true;

        if (classCodeToMatch != null){
            var associatedEntityNode = node.getElementsByTagName(entityName)[0];

            if (associatedEntityNode && associatedEntityNode.getAttributeNode("classCode")){
                var classCodeFound = associatedEntityNode.getAttributeNode("classCode").value;

                return (classCodeFound == classCodeToMatch);
            }

        }

        return false;
    };

    self.TypeCodeMatches = function (node, typeCodeToMatch){
        //i.e. don't care about typecode
        if(typeCodeToMatch == null)
            return true;

        if (typeCodeToMatch != null && node.getAttributeNode("typeCode")){

                var typeCodeFound = node.getAttributeNode("typeCode").value;

                return (typeCodeFound == typeCodeToMatch);
        }

        return false;
    };

    self.adaptParticipant = function(participantNode, personInfo){
        if (participantNode)
        {
            var associatedEntityNode = participantNode.getElementsByTagName("associatedEntity")[0];

            //all participant names are located under associatedPerson
            self.adaptPersonName(self.findPersonNameNode(associatedEntityNode.getElementsByTagName("associatedPerson")[0]), personInfo);
            self.adaptPersonAddress(self.findAddressNode(associatedEntityNode), personInfo);
            self.adaptPersonTelecom(self.findTelecomNodes(associatedEntityNode), personInfo);
            var ids = self.buildIdentifiers(associatedEntityNode);
            if (ids && ids.length) {
                personInfo.Identifiers = ids;
            }
        }
    };

    self.adaptPerformer = function(performerNode, personInfo){
        if (performerNode)
        {
            var associatedEntityNode = performerNode.getElementsByTagName("assignedEntity")[0];

            //all participant names are located under associatedPerson
            self.adaptPersonName(self.findPersonNameNode(associatedEntityNode.getElementsByTagName("assignedPerson")[0]), personInfo);
            self.adaptPersonAddress(self.findAddressNode(associatedEntityNode), personInfo);
            self.adaptPersonTelecom(self.findTelecomNodes(associatedEntityNode), personInfo);

            var ids = self.buildIdentifiers(associatedEntityNode);
            if (ids && ids.length) {
                personInfo.Identifiers = ids;
            }

        }
    };

    self.findServiceEvent = function(headerNode){
        var documentationOfNode = headerNode.getElementsByTagName("documentationOf")[0];

        if (documentationOfNode)
        {
            return  documentationOfNode.getElementsByTagName("serviceEvent")[0];
        }
    };

    self.adaptPatientNode = function(patientRoleNode, patientModel){
        self.adaptPersonAddress(self.findAddressNode(patientRoleNode), patientModel.PersonInfo);
        self.adaptPersonTelecom(self.findTelecomNodes(patientRoleNode), patientModel.PersonInfo);

        var patientNode = self.findPatientNode(patientRoleNode);
        var ids = self.buildIdentifiers(patientRoleNode);
        if (ids && ids.length) {
            patientModel.PersonInfo.Identifiers = ids;
        }

        if (patientNode)
        {
            self.adaptPersonName(self.findPersonNameNode(patientNode), patientModel.PersonInfo);

            //i.e.: race, enthicity, marital status, religious affiliation, languages, birthtime, gender
            self.adaptPatientDemographics(patientNode, patientModel);

        }
    };

    self.ImportAll = function(headerNode, headerModel){
        if (!headerNode) {
            return null;
        }

        if (!headerModel){
            headerModel =  headerModelCreator.create();
            headerModel.Authors = [];
        }

        var patientRoleNode = self.findPatientRoleNode(headerNode);

        if (patientRoleNode)
        {
            self.adaptPatientNode(patientRoleNode, headerModel.Patient);

            /*
            self.adaptPersonAddress(self.findAddressNode(patientRoleNode), headerModel.Patient.PersonInfo);
            self.adaptPersonTelecom(self.findTelecomNodes(patientRoleNode), headerModel.Patient.PersonInfo);

            var patientNode = self.findPatientNode(patientRoleNode);
            var ids = self.buildIdentifiers(patientRoleNode);
            if (ids && ids.length) {
                headerModel.Patient.PersonInfo.Identifiers = ids;
            }

            if (patientNode)
            {
                self.adaptPersonName(self.findPersonNameNode(patientNode), headerModel.Patient.PersonInfo);

                //i.e.: race, enthicity, marital status, religious affiliation, languages, birthtime, gender
                self.adaptPatientDemographics(patientNode, headerModel.Patient);

            }
            */

            self.adaptGuardian(patientRoleNode.getElementsByTagName("guardian")[0], headerModel.Guardian);

            //We don't import sending site... because we are going to be the sending site... so we need to load that from somewhere at some point
        }

       //participants are in the root under ClinicalDocument
        //adaptNextOfKin(headerNode, headerModel.NextOfKin);
        adaptKnownPerson(headerNode, headerModel.NextOfKin, self.findNextOfKin, self.adaptParticipant)
        //adaptPrimaryCareGiverAtHome(headerNode, headerModel.PrimaryCareGiverAtHome);
        adaptKnownPerson(headerNode, headerModel.PrimaryCareGiverAtHome, self.findPrimaryCareGiverAtHome, self.adaptParticipant)
        adaptKnownPerson(headerNode, headerModel.ClinicianToContactWithQuestions, self.findClinicianToContactWithQuestions, self.adaptParticipant)
        //adaptClinicianToContactWithQuestions(headerNode, headerModel.ClinicianToContactWithQuestions);


        var serviceEvent = self.findServiceEvent(headerNode);

        //i.e. where the performers are
        if (serviceEvent)
        {
            adaptKnownPerson(serviceEvent, headerModel.PrincipleCarePhysician, self.findPrincipalCarePhysician, self.adaptPerformer)
            adaptKnownPerson(serviceEvent, headerModel.CarePlanManager, self.findCarePlanManager, self.adaptPerformer)
            adaptKnownPerson(serviceEvent, headerModel.PrincipleHealthCareProvider, self.findPrincipleHealthCareProvider, self.adaptPerformer)
            adaptKnownPerson(serviceEvent, headerModel.PrincipleCareGiver, self.findPrincipleCareGiver, self.adaptPerformer)
            self.adaptOtherMembersOfCareTeam(self.findOtherMembersOfCareTeam(serviceEvent), headerModel.OtherMembersOfCareTeam);
        }

        self.adaptAuthors(self.findAuthors(headerNode), headerModel.Authors);
        self.adaptCustodian(self.findCustodian(headerNode), headerModel.Custodian);

        return headerModel;
    };    
};

exports.BuildSection = function (sectionNode, sectionCode) {
    var model = null;
    switch (sectionCode) {
        case SectionCode.VITAL:
            model = exports.VitalSectionAdapter(sectionNode);
            break;
        case SectionCode.PROBLEM:
            model = problemSectionModelCreator.create();
            exports.GenericSectionAdapter(sectionNode, model);
            break;
        case SectionCode.MEDICATION:
            model = medicationSectionModelCreator.create();
            exports.GenericSectionAdapter(sectionNode, model);
            break;
        case SectionCode.FUNCTIONALSTATUS:
            model = functionalStatusModelCreateor.create();
            exports.GenericSectionAdapter(sectionNode, model);
            break;
        case SectionCode.ADVANCEDIRECTIVE:
        case SectionCode.ALLERGIES:
        case SectionCode.ASSESSMENT:
        case SectionCode.CHIEFCOMPLAINT:
        case SectionCode.ENCOUNTERS:
        case SectionCode.FAMILYHISTORY:
        case SectionCode.HISTORYOFPRESENTILLNESS:
        case SectionCode.HISTORYOFPASTILLNESS:
        case SectionCode.HOSPITALDISCHARGEDIAGNOSIS:
        case SectionCode.IMMUNIZATION:
        case SectionCode.MEDICALEQUIPMENT:
        case SectionCode.PAYERS:
        case SectionCode.PLANOFCARE:
        case SectionCode.PROCEDURES:
        case SectionCode.RESULTS:
        case SectionCode.PHYSICALEXAM:
        case SectionCode.SOCIALHISTORY:
            model = genericSectionModelCreator.create();
            exports.GenericSectionAdapter(sectionNode, model);
            break;
    }

    return model;
};

//we expect to be sent the parsedXml document
exports.BuildAll = function (document) {
    var structuredBody, sectionNode, codeNode, codeValue, sectionMapEntry, documentModel, sectionModel, clidoc, headerAdapter, title;

    if (!document) {
        throw "Invalid method call. Expected a parsed xml document.";
    }

    documentModel = documentCreator.create();
    clidoc = XmlUtils.FindFirstElement('ClinicalDocument', document);

    headerAdapter = new exports.HeaderAdapter();
    headerAdapter.ImportAll(clidoc, documentModel.DocumentInfo.Header);

    title = XmlUtils.FindFirstElement("ClinicalDocument/title", document);    
    if (title && title.childNodes && title.childNodes.length) {               
        documentModel.DocumentInfo.Title = title.childNodes[0].nodeValue;
    }

    structuredBody = XmlUtils.FindFirstElement('ClinicalDocument/component/structuredBody', document);
    if (structuredBody) {
        _.each(structuredBody.childNodes, function (node) {
            if (node.tagName === "component") {
                sectionNode = node.getElementsByTagName("section")[0];
                if (sectionNode) {
                    codeNode = XmlUtils.FindFirstElement('code', sectionNode);
                    sectionMapEntry = null;

                    //check code, then templateId
                    if (codeNode && codeNode.getAttribute("code")) {
                        codeValue = codeNode.getAttribute("code");
                        sectionMapEntry = DocumentSectionToSectionCodeMap.findSection('LoincCode', codeValue);
                    }
                    else
                    {
                        var templateIdNode = XmlUtils.FindFirstElement('templateId', sectionNode);
                        if (templateIdNode && templateIdNode.getAttribute("root")) {
                            var templateIdValue = templateIdNode.getAttribute("code");
                            sectionMapEntry = DocumentSectionToSectionCodeMap.findSection('TemplateId', codeValue);
                        }
                    }
                    
                    if (sectionMapEntry) {
                        sectionModel = exports.BuildSection(sectionNode, sectionMapEntry.Enum);
                        if (sectionModel) {
                            documentModel[sectionMapEntry.DocumentPropertyName] = sectionModel;
                        }
                    }
                    else{
                        //we don't understand this section, so just include it in its raw form
                        documentModel.OtherSections.push((new XmlSerializer()).serializeToString(node));
                    }
                }
            }
        });
    }
    else {
        throw "Invalid xml document. Expected to find a structured body 'ClinicalDocument/component/structuredBody'.";
    }
    
    return documentModel;
};