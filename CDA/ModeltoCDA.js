var xml = require("../utils/xml.js").xml,
    cdaTools = require("../utils/xml.js").cda,
    uuid = require("../utils/uuid.js"),
    DOMParser = require('xmldom').DOMParser,
    DocumentSectionToSectionCodeMap = require('./Constants.js').CONSTANTS.MAP.DocumentSectionToSectionCode,
    _ = require("underscore");


exports.cda = (function () {
    var self = this;
    var Σ = xml.CreateNode;
    var A = xml.CreateAttributeWithNameAndValue;

    this.AllergySection = function() {
        var self = this;

        this.AdaptAllergySectionModel = function (allergyModel, cdaDocument) {
            if (!allergyModel) {
                return null;
            }

            var x = cdaDocument;
            var sectionText = cdaTools.BuildSectionText(allergyModel, cdaDocument, "ALLERGIES");

            var node = Σ(x, "component",
                Σ(x, "section",
                    Σ(x, "templateId",
                        A(x, "root", "2.16.840.1.113883.10.20.22.2.6")),
                    cdaTools.BuildCodedValueLOINC("48765-2", "Allergies, adverse reactions, alerts", x),
                    self.BuildTitle(allergyModel, cdaDocument),
                    sectionText));
            var sectionNode = node.getElementsByTagName("section")[0];

            return node;
        };

        this.BuildAll = function (allergyModel, cdaDocument) {
            return self.AdaptAllergySectionModel(allergyModel, cdaDocument);
        };

        this.BuildTitle = function (allergyModel, cdaDocument) {
            return Σ(cdaDocument, "title", "ALLERGIES, ADVERSE REACTIONS, ALERTS");
        };
    };

    this.ImmunizationSection = function() {
        var self = this;

        this.AdaptImmunizationSectionModel = function (immunizationModel, cdaDocument) {
            if (!immunizationModel) {
                return null;
            }

            var x = cdaDocument;
            var sectionText = cdaTools.BuildSectionText(immunizationModel, cdaDocument, "IMMUNIZATIONS");

            var node = Σ(x, "component",
                Σ(x, "section",
                    Σ(x, "templateId",
                        A(x, "root", "2.16.840.1.113883.10.20.22.2.2")),
                    cdaTools.BuildCodedValueLOINC("11369-6", "History of immunizations", x),
                    self.BuildTitle(immunizationModel, cdaDocument),
                    sectionText));
            var sectionNode = node.getElementsByTagName("section")[0];
            
            //TODO: this does not validate in CDA_SDTC.xsd, need to make sure it comforms to CDA and also the CCDA template
            //// Add entries
            //_.each(immunizationModel.Immunizations, function (s) {
            //    var newEntry = Σ(x, "entry",
            //        Σ(x, "substanceAdministration",
            //            A(x, "classCode", "SBADM"),
            //            A(x, "moodCode", "EVN"),
            //            A(x, "negationInd", "false"),
            //            Σ(x, "templateId",
            //                A(x, "root", "2.16.840.1.113883.10.20.22.4.52")),
            //            Σ(x, "id",
            //                A(x, "root", uuid.v4()))));

            //    var sbadm = newEntry.getElementsByTagName("substanceAdministration");

            //    // TODO

            //    sectionNode.appendChild(newEntry);
            //});

            return node;
        };

        this.BuildAll = function (immunizationModel, cdaDocument) {
            return self.AdaptImmunizationSectionModel(immunizationModel, cdaDocument);
        };

        this.BuildTitle = function (immunizationModel, cdaDocument) {
            return Σ(cdaDocument, "title", "IMMUNIZATIONS");
        };
    };

    this.FunctionalStatusSection = function() {
        var self = this;

        var buildValueEntry = function (doc, valueName, value, effectiveTime) {
            if (value != null && value != '') {
                var entryNode = Σ(doc, "entry",
                    A(doc, "typeCode", "DRIV"),
                    Σ(doc, "observation", 
                        Σ(doc, "code",
                            A(doc, "code", "TEMP-Functional-Status-" + valueName)),
                        Σ(doc, "statusCode",
                            A(doc, "code", "completed")),
                        Σ(doc, "effectiveTime",
                            A(doc, "value", effectiveTime)),
                        Σ(doc, "value",
                            A(doc, "xsi:type", "ST"),
                            value.toString())));
                return entryNode;
            }
        };

        var isNullOrEmpty = function (val) {
            return val == null || val == '';
        }
        
        this.AdaptFunctionalStatusSectionModel = function (functionalStatusModel, cdaDocument) {
            if (!functionalStatusModel) {
                return null;
            }

            var x = cdaDocument;
            //need a foreach to step through the entries
            var node = Σ(x, "component",
                        Σ(x, "section",
                            Σ(x, "templateId",
                                A(x, "root", "2.16.840.1.113883.10.20.22.2.14")),
                            cdaTools.BuildCodedValueLOINC("47420-5", "FUNCTIONAL STATUS", x),  // TODO
                            self.BuildTitle(functionalStatusModel, cdaDocument),
                            cdaTools.BuildSectionText(functionalStatusModel, cdaDocument, "Functional Status")));
            var sectionNode = node.getElementsByTagName("section")[0];
            //TODO: this is not validating on CDA_SDTC.xsd, needs to be worked on to match the observation template
            /*
            _.each(functionalStatusModel.PainScales, function (entry) {
                if (entry.PainScore != null && entry.PainScore != '')
                    var entryNode = Σ(x, "entry",
                        A(x, "typeCode", "DRIV"),
                        Σ(x, "code",
                            A(x, "code", "TEMP-Functional-Status-PainScore")),
                        Σ(x, "statusCode",
                            A(x, "code", "completed")),
                        Σ(x, "effectiveTime",
                            A(x, "value", entry.PainScoreEffectiveTime)),
                        Σ(x, "value",
                            A(x, "xsi:type", "INT"),
                            A(x, "value", entry.PainScore.toString())));
                    sectionNode.appendChild(entryNode);
            });
            */
            return node;
        };

        this.BuildAll = function (functionalStatusModel, cdaDocument) {
            return self.AdaptFunctionalStatusSectionModel(functionalStatusModel, cdaDocument);
        };

        this.BuildTitle = function (functionalStatusModel, cdaDocument) {
            return Σ(cdaDocument, "title", "FUNCTIONAL STATUS");
        };
    };

    this.ProblemsSection = function () {
        var self = this;

        self.AdaptProblemSectionModel = function (sectionModel, cdaDocument) {
            var Σ = xml.CreateNode;
            var A = xml.CreateAttributeWithNameAndValue;
            var x = cdaDocument;

            var currentDate = new Date();

            var node =
                Σ(x, "component",
                    Σ(x, "section",

                        //C-CDA Problem Section with Coded Entries Optional template id
                        Σ(x, "templateId", A(x, "root", "2.16.840.1.113883.10.20.22.2.5")),
					
                        Σ(x, "code", A(x, "code", "11450-4"), A(x, "codeSystem", "2.16.840.1.113883.6.1"), A(x, "codeSystemName", "LOINC"), A(x, "displayName", "PROBLEM LIST")),
                        Σ(x, "title", "PROBLEMS"),                    
                        cdaTools.BuildSectionText(sectionModel, x, "Problems"), 
                        self.BuildDSMAxis("TEMP-dsm-iv-axis-1", "DSM Axis I", currentDate, sectionModel.DSM_AXIS_1, x),
                        self.BuildDSMAxis("TEMP-dsm-iv-axis-2", "DSM Axis II", currentDate, sectionModel.DSM_AXIS_2, x),
                        self.BuildDSMAxis("TEMP-dsm-iv-axis-3", "DSM Axis III", currentDate, sectionModel.DSM_AXIS_3, x),
                        self.BuildDSMAxis("TEMP-dsm-iv-axis-4", "DSM Axis IV", currentDate, sectionModel.DSM_AXIS_4, x),

                        self.BuildLTC(currentDate, x),

                        sectionModel.Problems.forEach(function (problem) {
                            self.BuildProblemEntry(problem, x);
                        })                    
                ));

            return node;
        };

        self.BuildCurrentSeverityEntryRelationship = function (severityCode, severityDisplayName, cdaDocument) {
            var Σ = xml.CreateNode;
            var A = xml.CreateAttributeWithNameAndValue;
            var x = cdaDocument;

            if (severityCode == null || severityCode == "")
                return null;

            return Σ(x, 'entryRelationship', A(x, "typeCode", "SUBJ"), A(x, "inversionInd", "true"),
                Σ(x, 'observation', A(x, "classCode", "OBS"), A(x, "moodCode", "EVN"),
                    Σ(x, 'templateId', A(x, "root", "2.16.840.1.113883.10.20.22.4.8")),
                    Σ(x, 'code', A(x, "code", "SEV"),
                        A(x, "codeSystem", "2.16.840.1.113883.5.4"),
                        A(x, "codeSystemName", "ActCode"),
                        A(x, "displayName", "Severity Observation")),
                    Σ(x, 'statusCode', A(x, "code", "completed")),
                    Σ(x, 'value', A(x, "xsi:type", "CD"),
                        A(x, "code", severityCode), A(x, "displayName", severityDisplayName),
                        A(x, "codeSystem", "2.16.840.1.113883.6.96"), A(x, "codeSystemName", "SNOMED-CT"))
                )
            );
        }

        self.BuildWorstSeverityEntryRelationship = function (severityCode, severityDisplayName, cdaDocument) {
            var Σ = xml.CreateNode;
            var A = xml.CreateAttributeWithNameAndValue;
            var x = cdaDocument;

            if (severityCode == null || severityCode == "")
                return null;

            return Σ(x, 'entryRelationship', A(x, "typeCode", "SUBJ"), A(x, "inversionInd", "true"),
                    Σ(x, 'observation', A(x, "classCode", "OBS"), A(x, "moodCode", "EVN"),
                        Σ(x, 'code', A(x, "code", "TEMP-severity-of-worst-occurrence"),
                            A(x, "codeSystem", "TEMP-codeSystem-OID"),
                            A(x, "codeSystemName", "TEMP-codeSystem-name"),
                            A(x, "displayName", "Severity of worst occurance/episode")),
                        Σ(x, 'value', A(x, "xsi:type", "CD"),
                            A(x, "code", severityCode), A(x, "displayName", severityDisplayName),
                            A(x, "codeSystem", "2.16.840.1.113883.6.96"), A(x, "codeSystemName", "SNOMED-CT"))
                    )
                );
        }

        self.BuildLTC = function (date, cdaDocument) {
            var Σ = xml.CreateNode;
            var A = xml.CreateAttributeWithNameAndValue;
            var x = cdaDocument;

            var node =
                Σ(x, "entry", A(x, "typeCode", "DRIV"),
                    Σ(x, "act", A(x, "classCode", "ACT"), A(x, "moodCode", "EVN"),
                        Σ(x, "templateId", A(x, "root", "2.16.840.1.113883.10.20.22.4.3")),
                        Σ(x, "id", A(x, "root", uuid.v4())),
                        Σ(x, 'code', A(x, "code", "CONC"), A(x, "codeSystem", "2.16.840.1.113883.5.6"), A(x, "displayName", "Concern")),
                        Σ(x, 'statusCode', A(x, "code", "completed")),
                        Σ(x, 'effectiveTime',
                            Σ(x, 'low', A(x, "value", cdaTools.toGTSString(date, false)))),
                        Σ(x, 'entryRelationship', A(x, "typeCode", "SUBJ"),
                            Σ(x, 'observation', A(x, "classCode", "OBS"), A(x, "moodCode", "EVN"), A(x, "negationInd", "false"),
                                Σ(x, "templateId", A(x, "root", "2.16.840.1.113883.10.20.22.4.4")),
                                Σ(x, "id", A(x, "root", uuid.v4())),
                                Σ(x, 'code', A(x, "code", "ASSERTION"), A(x, "codeSystem", "2.16.840.1.113883.5.4"), A(x, "displayName", "HL7ActCode")),
                                Σ(x, 'statusCode', A(x, "code", "completed")),
                                Σ(x, 'value', A(x, "xsi:type", "CD"),
                                    A(x, "code", "TEMP-life-limiting-condition-present"), A(x, "displayName", "Presence of a life limiting condition (>50% possibility of death within 2 yrs)"),
                                    A(x, "codeSystem", "TEMP-codeSystem-OID"), A(x, "codeSystemName", "TEMP-codeSystem-name"))
                             )
                        )
                     )
                );

            return node;
        }

        self.BuildDSMAxis = function (code, displayName, date, value, cdaDocument) {

            var Σ = xml.CreateNode;
            var A = xml.CreateAttributeWithNameAndValue;
            var x = cdaDocument;

            var node = Σ(x, "entry",
                Σ(x, 'observation', A(x, "classCode", "OBS"), A(x, "moodCode", "EVN"),
                    Σ(x, 'code', A(x, "code", code), A(x, "displayName", displayName), A(x, "codeSystem", "TEMP-codeSystem-OID"), A(x, "codeSystemName", "TEMP-codeSystem-name")),
                    Σ(x, 'statusCode', A(x, "code", "completed")),
                    Σ(x, 'effectiveTime',
                        Σ(x, 'low', A(x, "value", cdaTools.toGTSString(date, false)))),
                    Σ(x, 'value', A(x, "xsi:type", "ST"), value)
                )
            );

            return node;
        };

        self.BuildProblemEntry = function (p, cdaDocument) {

            var Σ = xml.CreateNode;
            var A = xml.CreateAttributeWithNameAndValue;
            var x = cdaDocument;

            var code = ((p.Code == "" || p.Code == null) ? null : p.Code);
            var dateOfOnset = (p.DateOfOnset != null ? p.DateOfOnset : null);
            var dateOfResolution = (p.ResolutionDate != null ? p.ResolutionDate : null);

            var node =
                Σ(x, "entry", A(x, "typeCode", "DRIV"),
                    Σ(x, "act", A(x, "classCode", "ACT"), A(x, "moodCode", "EVN"),
                        Σ(x, "templateId", A(x, "root", "2.16.840.1.113883.10.20.22.4.3")),
                        Σ(x, "id", A(x, "root", uuid.v4())),
                        Σ(x, 'code', A(x, "code", "CONC"), A(x, "codeSystem", "2.16.840.1.113883.5.6"), A(x, "displayName", "Concern")),
                        Σ(x, 'statusCode', A(x, "code", "completed")),

                        //effectiveTimeNode
                        cdaTools.BuildEffectiveTime(dateOfOnset, dateOfResolution, null, false, x),

                        Σ(x, "entryRelationship", A(x, "typeCode", "SUBJ"),
                            Σ(x, "observation", A(x, "classCode", "OBS"), A(x, "moodCode", "EVN"),
                                Σ(x, "templateId", A(x, "root", "2.16.840.1.113883.10.20.22.4.4")),
                                Σ(x, "id", A(x, "root", uuid.v4())),
                                Σ(x, 'code', A(x, "code", "55607006"), A(x, "codeSystem", "2.16.840.1.113883.5.4"), A(x, "displayName", "Problem")),
                                Σ(x, 'statusCode', A(x, "code", "completed")),

                                //effectiveTimeNode
                                cdaTools.BuildEffectiveTime(dateOfOnset, dateOfResolution, null, false, x),

                                //value node
                                cdaTools.BuildSnomedCTValueCD(p.Code, p.Name, x),

                                cdaTools.BuildPerformer(x, p.Diagnoser),

                                self.BuildCurrentSeverityEntryRelationship(p.CurrentSeverity, "", x),

                                self.BuildWorstSeverityEntryRelationship(p.WorstSeverity, "", x)

                            )
                        )
                    )
                );
            return node;
        }

        self.BuildAll = function (sectionModel, cdaDocument) {
            if (!sectionModel)
                return null;

            return self.AdaptProblemSectionModel(sectionModel, cdaDocument);
        };
    };

    this.VitalsSection = function () {
        var self = this;
        var Σ = xml.CreateNode;
        var A = xml.CreateAttributeWithNameAndValue;
        this.AdaptVitalsSectionModel = function (vitalModel, cdaDocument) {
            var x = cdaDocument;

            //need a foreach to step through the entries
            var node = Σ(x, "component",
                        Σ(x, "section",
                            Σ(x, "templateId",
                                A(x, "root", "2.16.840.1.113883.10.20.22.2.4")),
                            cdaTools.BuildCodedValueLOINC("8716-3", "VITAL SIGNS", x),
                            self.BuildTitle(vitalModel, cdaDocument),
                            cdaTools.BuildSectionText(vitalModel, cdaDocument, "Vitals")));
            var sectionNode = node.getElementsByTagName("section")[0];

            _.each(vitalModel.Vitals, function (entry) {
                var entryNode = Σ(x, "entry",
                                    A(x, "typeCode", "DRIV"),
                                        Σ(x, "organizer",
                                              A(x, "classCode", "CLUSTER"),
                                              A(x, "moodCode", "EVN"),
                                            Σ(x, "templateId",
                                                A(x, "root", "2.16.840.1.113883.10.20.22.4.26")),
                                            Σ(x, "id",
                                                A(x, "root", uuid.v4())),
                                            Σ(x, "code",
                                                A(x, "code", "46680005"),
                                                A(x, "codeSystem", "2.16.840.1.113883.6.96"),
                                                A(x, "codeSystemName", "SNOMED-CT"),
                                                A(x, "displayName", "Vital Signs")),
                                            Σ(x, "statusCode",
                                                A(x, "code", "completed")),
                                            cdaTools.BuildEffectiveTime(null, null, entry.DateRecorded, false, x),
                                            self.BuildHeight(entry, cdaDocument),
                                            self.BuildWeight(entry, cdaDocument),
                                            self.BuildBMI(entry, cdaDocument),
                                            self.BuildSystolicBP(entry, cdaDocument),
                                            self.BuildDiastolicBP(entry, cdaDocument),
                                            self.BuildHeartRate(entry, cdaDocument),
                                            self.BuildRespitoryRate(entry, cdaDocument),
                                            self.BuildPulse(entry, cdaDocument),
                                            self.BuildOxygenSaturation(entry, cdaDocument),
                                            self.BuildTemperature(entry, cdaDocument)));                
                sectionNode.appendChild(entryNode);
            });
            return node;
        };

        this.BuildAll = function (sectionModel, cdaDocument) {
            return self.AdaptVitalsSectionModel(sectionModel, cdaDocument);
        };

        this.BuildTitle = function (vitalModel, cdaDocument) {
            return Σ(cdaDocument, "title", "VITAL SIGNS");
        };

        this.BuildObservation = function (vitalEntryModel, cdaDocument, code, displayName, PQValue, PQUnit) {
            var x = cdaDocument;
            if (_.isUndefined(PQValue) || _.isNull(PQValue)) {
                return null;
            }

            if (_.isString(PQValue) && _.isEmpty(PQValue)) {
                return null;
            }

            return Σ(x, "component",
                        Σ(x, "observation",
                            A(x, "classCode", "OBS"),
                            A(x, "moodCode", "EVN"),
                                Σ(x, "templateId",
                                    A(x, "root", "2.16.840.1.113883.10.20.22.4.27")),
                                Σ(x, "id",
                                    A(x, "root", uuid.v4())),
                                cdaTools.BuildCodedValueLOINC(code, displayName, x),
                                cdaTools.BuildStatusCode("completed", x),
                                cdaTools.BuildEffectiveTime(null, null, vitalEntryModel.DateRecorded, true, x),
                                cdaTools.CreateValuePQ(PQValue, PQUnit, x),
                                cdaTools.CreateInterpretationCodeCE("N", "2.16.840.1.113883.5.83", null, null, x)));                       
        };

        this.BuildHeight = function (vitalEntryModel, cdaDocument) {
            return self.BuildObservation(vitalEntryModel, cdaDocument, "8302-2", "Height", vitalEntryModel.Height, vitalEntryModel.HeightUnit);
        };

        this.BuildWeight = function (vitalEntryModel, cdaDocument) {
            return self.BuildObservation(vitalEntryModel, cdaDocument, "3141-9", "Weight - Measured", vitalEntryModel.Weight, vitalEntryModel.WeightUnit);
        };

        this.BuildBMI = function (vitalEntryModel, cdaDocument) {
            return self.BuildObservation(vitalEntryModel, cdaDocument, "39156-5", "BMI (Body Mass Index)", vitalEntryModel.BMI, "kg/m2");
        };

        this.BuildSystolicBP = function (vitalEntryModel, cdaDocument) {
            return self.BuildObservation(vitalEntryModel, cdaDocument, "8480-6", "BP Systolic", vitalEntryModel.SystolicBP, "mm[Hg]");
        };

        this.BuildDiastolicBP = function (vitalEntryModel, cdaDocument) {
            return self.BuildObservation(vitalEntryModel, cdaDocument, "8462-4", "BP Diastolic", vitalEntryModel.DiastolicBP, "mm[Hg]");
        };

        this.BuildHeartRate = function (vitalEntryModel, cdaDocument) {
            return self.BuildObservation(vitalEntryModel, cdaDocument, "8867-4", "Heart rate", vitalEntryModel.HeartRate, "/min");
        };

        this.BuildRespitoryRate = function (vitalEntryModel, cdaDocument) {
            return self.BuildObservation(vitalEntryModel, cdaDocument, "9279-1", "Respiratory rate", vitalEntryModel.RespiratoryRate, "/min");
        };

        this.BuildPulse = function (vitalEntryModel, cdaDocument) {
            return self.BuildObservation(vitalEntryModel, cdaDocument, "temp-pulse-code", "Pulse", vitalEntryModel.Pulse, "/min");
        };

        this.BuildOxygenSaturation = function (vitalEntryModel, cdaDocument) {
            return self.BuildObservation(vitalEntryModel, cdaDocument, "2710-2", "O2 % BldC Oximetry", vitalEntryModel.O2Sat, "%");
        };

        this.BuildTemperature = function (vitalEntryModel, cdaDocument) {
            return self.BuildObservation(vitalEntryModel, cdaDocument, "8310-5", "Body Temperature", vitalEntryModel.Temperature, vitalEntryModel.TemperatureUnit);
        };

    };
    
    this.CDAHeaderPatient = function () {
        var self = this;
        var Σ = xml.CreateNode;
        var A = xml.CreateAttributeWithNameAndValue;

        self.BuildLegalAuthenticator = function(cdaDocument, userModel) {
            if(userModel == null) return null;

            var x = cdaDocument;

            var assignedEntity = cdaTools.BuildAssignedEntity(cdaDocument, userModel);

            var node = Σ(x, "legalAuthenticator",
                cdaTools.BuildTime(x, "time", null, null, new Date(), true),
                Σ(x, "signatureCode", A(x, "code", "S")),
                assignedEntity
            );

            return node;
        };

        //patient is a personInfo
        self.BuildRecordTarget = function (cdaDocument, patient, sendingSite, guardian) {
            if (patient == null || patient.PersonInfo == null)
                return null;

            var x = cdaDocument;
            var patientBirthDate = patient.BirthTime;
            if (!_.isDate(patientBirthDate)) {
                try {
                    patientBirthDate = new Date(patient.BirthTime);
                }
                catch (err) {
                    patientBirthDate = null;
                }
            }

            var node = 
                Σ(x, "recordTarget",
                    Σ(x, "patientRole",

                        //put ids here
                        (patient.PersonInfo.Identifiers.length > 0 ? Σ(x, 'id', A(x, 'root', patient.PersonInfo.Identifiers[0].Root), A(x, 'extension', patient.PersonInfo.Identifiers[0].Extension)) : null),
                        //Σ("id", 

                        //need to add country
                        cdaTools.BuildAddress(x, "HP", patient.PersonInfo.StreetAddress, patient.PersonInfo.City, patient.PersonInfo.State, patient.PersonInfo.ZipCode, patient.PersonInfo.Country),

                        cdaTools.BuildPhoneNumber(x, patient.PersonInfo.Phone, "HP"),
                        cdaTools.BuildPhoneNumber(x, patient.PersonInfo.AltPhone, "HP"),
                        cdaTools.BuildPhoneNumber(x, patient.PersonInfo.Pager, "MC"),

                        cdaTools.BuildEmailAddress(x, patient.PersonInfo.Email),

                        //add gender to model
                        (patient.PersonInfo != null && (patient.PersonInfo.FirstName != "" && patient.PersonInfo.FirstName != null) && 
                            (patient.PersonInfo.LastName != "" && patient.PersonInfo.LastName != null) && patient.Gender != ""  ?
                        
                        Σ(x, "patient",
                            cdaTools.BuildName(x, patient.PersonInfo.FirstName, patient.PersonInfo.MiddleName, patient.PersonInfo.LastName, patient.PersonInfo.Suffix),
                            cdaTools.BuildGender(x, patient.GenderCode),
                            _.isNull(patient.BirthTime) || _.isUndefined(patient.BirthTime) ? null : cdaTools.BuildTime(x, "birthTime", null, null, patientBirthDate, false),

                            //marital status
                            _.isNull(patient.MaritalStatusCode) || _.isUndefined(patient.MaritalStatusCode) ? null : cdaTools.BuildCD("maritalStatusCode", patient.MaritalStatusCode, patient.MaritalStatusCode, "2.16.840.1.113883.5.2", "MaritalStatusCode", x),

                            //religious affiliation
                            _.isNull(patient.ReligionCode) || _.isUndefined(patient.ReligionCode) ? null : cdaTools.BuildCD("religiousAffiliationCode", patient.ReligionCode, patient.ReligionCode, "2.16.840.1.113883.5.1076", "HL7 Religious Affiliation", x),

                            //race
                            _.isNull(patient.RaceCode) || _.isUndefined(patient.RaceCode) ? null : cdaTools.BuildCD("raceCode", patient.RaceCode, patient.RaceCode, "2.16.840.1.113883.6.238", "Race &amp; Ethnicity - CDC", x),

                            //ethnicity
                            _.isNull(patient.EthnicityCode) || _.isUndefined(patient.EthnicityCode) ? null : cdaTools.BuildCD("ethnicGroupCode", patient.EthnicityCode, patient.EthnicityCode, "2.16.840.1.113883.6.238", "Race &amp; Ethnicity - CDC", x),

                            self.BuildLanguage(x, patient.PrimaryLanguageCode, true),

                            self.BuildLanguage(x, patient.OtherLanguageCode, false)
                        )
                            
                        : null),

                        cdaTools.BuildGuardian(x, guardian),

                        self.BuildSendingSite(x, sendingSite)

                ));

            return node;
        };

        self.BuildServiceEvent = function(cdaDocument, principalCarePhysician, carePlanManager, principleHealthCareProvider, principleCareGiver, otherMembersOfCareTeam)
        {
            var x = cdaDocument, documentationOfNode, serviceEventNode;

            
            if (principalCarePhysician == null && carePlanManager == null && principleHealthCareProvider == null &&
                principleCareGiver == null && otherMembersOfCareTeam == null)
                return null;

            documentationOfNode = Σ(x, "documentationOf");
            serviceEventNode = Σ(x, "serviceEvent",
                    (principalCarePhysician != null ?
                        cdaTools.BuildPerformer(x, principalCarePhysician, "PRF", "PCP", "2.16.840.1.113883.12.443", "LOINC", "Primary Care Physician")
                        : null),

                    (carePlanManager != null ?
                        cdaTools.BuildPerformer(x, carePlanManager, "PRF", "???", "2.16.840.1.113883.12.443", "LOINC", "??")
                        : null),

                    (principleHealthCareProvider != null ?
                        cdaTools.BuildPerformer(x, principleHealthCareProvider, "PRF", "???", "2.16.840.1.113883.12.443", "LOINC", "??")
                        : null),

                    (principleCareGiver != null ?
                        cdaTools.BuildPerformer(x, principleCareGiver, "PRF", "???", "2.16.840.1.113883.12.443", "LOINC", "??")
                        : null)
            );
            documentationOfNode.appendChild(serviceEventNode);

            _.each(otherMembersOfCareTeam, function (performer) {
                var newnode = cdaTools.BuildPerformer(x, performer, "PRF", "???", "2.16.840.1.113883.12.443", "LOINC", "??");
                if (newnode) {
                    serviceEventNode.appendChild(newnode);
                }
            })

            return documentationOfNode;

        }

        //an author is really a personInfo class
        self.BuildAuthor = function (cdaDocument, author) {
            if (author == null)
                return null;

            var x = cdaDocument;

            var firstNameExists = (author.FirstName != "" && author.FirstName != null);
            var lastNameExists = (author.LastName != "" && author.LastName != null);            

            var node =
                Σ(x, "author",
                    cdaTools.BuildTime(x, "time", null, null, new Date()),
                    Σ(x, "assignedAuthor",
                        //TODO: this needs to be expanded to include more than one id
                        (author.Identifiers && author.Identifiers.length > 0 ? Σ(x, 'id', A(x, 'root', author.Identifiers[0].Root), A(x, 'extension', author.Identifiers[0].Extension)) : null),

                        cdaTools.BuildAddress(x, "WP", author.StreetAddress, author.City, author.State, author.ZipCode, author.Country),

                        (author.Phone && author.Phone.length) ? cdaTools.BuildPhoneNumber(x, author.Phone, "WP") : null,
                        (author.AltPhone && author.AltPhone.length) ? cdaTools.BuildPhoneNumber(x, author.AltPhone, "WP") : null,
                        (author.Pager && author.Pager.length) ? cdaTools.BuildPhoneNumber(x, author.Pager, "MC") : null,

                        (author.Email && author.Email.length) ? cdaTools.BuildEmailAddress(x, author.Email) : null,

                        (firstNameExists || lastNameExists ?
                        Σ(x, 'assignedPerson',
                            cdaTools.BuildName(x, author.FirstName, null, author.LastName, author.Suffix))
                        : null)
                        ));

            return node;
        }

        self.BuildLanguage = function(cdaDocument, languageCode, isPreferred)
        {
            if(languageCode == null)
                return null;

            var x = cdaDocument;
            return Σ(x, "languageCommunication",
                Σ(x, "templateId", A(x, "root", "1.3.6.1.4.1.19376.1.5.3.1.2.1")),

                Σ(x, "languageCode", A(x, "code", languageCode)),
                Σ(x, "preferenceInd", A(x, "value", isPreferred.toString()))
            );
        }

        self.BuildCustodian = function (cdaDocument, organization)
        {
            if (organization == null)
                return null;

            var x = cdaDocument;

            //custodian
            return Σ(x, "custodian",
                Σ(x, "assignedCustodian",
                    Σ(x, "representedCustodianOrganization",
                        //TODO: this needs to be expanded to include more than one id
                        (organization.Identifiers && organization.Identifiers.length > 0 ? Σ(x, 'id', A(x, 'root', organization.Identifiers[0].Root), A(x, 'extension', organization.Identifiers[0].Extension)) : null),
                        Σ(x, "name", organization.Name),
                        cdaTools.BuildPhoneNumber(x, organization.Phone, "WP"),
                        cdaTools.BuildAddress(x, "WP", organization.StreetAddress, organization.City, organization.State, organization.ZipCode, organization.Country)
                        )
                 )
             );
        
        }

        //this (organizationInfo) could be abstracted to cda tools
        self.BuildSendingSite = function (cdaDocument, organization)
        {
            if (organization == null)
                return null;

            var x = cdaDocument;

            return Σ(x, "providerOrganization",
                (organization.Identifiers && organization.Identifiers.length > 0 ? Σ(x, 'id', A(x, 'root', organization.Identifiers[0].Root), A(x, 'extension', organization.Identifiers[0].Extension)) : null),
                Σ(x, "name", organization.Name),
                cdaTools.BuildPhoneNumber(x, organization.Phone, "WP"),
                cdaTools.BuildAddress(x, "WP", organization.StreetAddress, organization.City, organization.State, organization.ZipCode, organization.Country)

            );

        }

        //this appends rather than builds... it adds a bunch of nodes to the incoming document. the builders just build and return.
        this.AppendHeaderDocumentIdentification = function (cdaDocument, headerModel, docId) {
            var x = cdaDocument, effectiveTime, lowTime;

            cdaDocument.documentElement.appendChild(Σ(x, "realmCode", A(x, "code", "US")));

            cdaDocument.documentElement.appendChild(Σ(x, "typeId", A(x, "root", "2.16.840.1.113883.1.3"), A(x, "extension", "POCD_HD000040")));

            cdaDocument.documentElement.appendChild(Σ(x, "templateId", A(x, "root", "2.16.840.1.113883.10.20.22.1.1")));

            //this template id is the id for the transfer of care document... note, this may change
            cdaDocument.documentElement.appendChild(Σ(x, "templateId", A(x, "root", "2.16.840.1.113883.10.20.22.1.12")));

            //this is the unique document ID
            cdaDocument.documentElement.appendChild(Σ(x, "id", A(x, "root", docId)));

            cdaDocument.documentElement.appendChild(Σ(x, "code", A(x, "codeSystem", "2.16.840.1.113883.6.1"), A(x, "codeSystemName", "LOINC"), A(x, "code", "18761-7"), A(x, "displayName", "Transfer summarization note")));
        
            cdaDocument.documentElement.appendChild(Σ(x, "title", "Transfer Summarization Note"));

            if (headerModel.EncounterTime != undefined && headerModel.EncounterTime != '') {
                if (headerModel.DatePatientArrivedAtSendingSite) {
                    lowTime = headerModel.DatePatientArrivedAtSendingSite;
                }
                //TODO: This is causing the CDA.xsd to error but it looks to be valid CDA, need to figure out
                //cdaDocument.documentElement.appendChild(cdaTools.BuildEffectiveTime(lowTime, null, headerModel.EncounterTime, null, x)); 
                cdaDocument.documentElement.appendChild(cdaTools.BuildEffectiveTime(null, null, headerModel.EncounterTime, null, x)); 
            }

            cdaDocument.documentElement.appendChild(Σ(x, "confidentialityCode", A(x, "code", headerModel.ConfidentialityCode), A(x, "codeSystem", "2.16.840.1.113883.5.25")));

            cdaDocument.documentElement.appendChild(Σ(x, "languageCode", A(x, "code", "en-US")));

            //GD: how to handle document versioning is may be something the SEE tool probably needs to worry about
            cdaDocument.documentElement.appendChild(Σ(x, "setId", A(x, "extension", "sTT988"), A(x, "root", "2.16.840.1.113883.19.5.99999.19")));

            cdaDocument.documentElement.appendChild(Σ(x, "versionNumber", A(x, "value", "1")));
        };
    };

    //NOTE: not sure what to do about this... the document string is now kind of irrelevant since we build it below.
    //if there's other things, I think we should explicitly pick them out and add them to the new, rather the find/replace method
    this.BuildAll = function(documentModel) //, documentString)
    {
        var documentString;
        var Σ = xml.CreateNode;
        var A = xml.CreateAttributeWithNameAndValue;
        var buildGenericSection = function (x, sectionModel, sectionPropertyName) {

            var mapEntry = DocumentSectionToSectionCodeMap.findSection('DocumentPropertyName', sectionPropertyName);
            var title = sectionModel.Title;
            if (!title) {
                title = mapEntry.Title;
            } 

            var codeNode = mapEntry && mapEntry.LoincCode.length > 0 ?
                Σ(x, 'code',
                    A(x, 'code', mapEntry.LoincCode[0]),
                    A(x, 'codeSystem', '2.16.840.1.113883.6.1'),
                    A(x, 'codeSystemName', 'LOINC')) : null;

            var newnode = Σ(x, 'component',
                            Σ(x, 'section',
                                Σ(x, "templateId",
                                    A(x, "root", mapEntry.TemplateId)),
                                codeNode,
                            Σ(x, 'title', title),
                            cdaTools.BuildSectionText(sectionModel, x)));
            return newnode;
        };


        //if (!documentString) { //if they included a documentString to initialize with then use it, otherwise create a blank CDA doccli
        documentString = "<?xml version='1.0' standalone='yes'?><ClinicalDocument xmlns:xsi='http://www.w3.org/2001/XMLSchema-instance' xmlns='urn:hl7-org:v3' xmlns:cda='urn:hl7-org:v3' xmlns:sdtc='urn:hl7-org:sdtc'></ClinicalDocument>";
        //}

        var x = new DOMParser().parseFromString(documentString, 'text/xml');

        var headerModel = documentModel.DocumentInfo.Header;

        var headerBuilder = new self.CDAHeaderPatient();

        var newnode;



        //building the header
        headerBuilder.AppendHeaderDocumentIdentification(x, headerModel, uuid.v4());

        x.documentElement.appendChild(headerBuilder.BuildRecordTarget(x, headerModel.Patient, headerModel.SendingSite, headerModel.Guardian));

        _.each(headerModel.Authors, function (author) {
            x.documentElement.appendChild(headerBuilder.BuildAuthor(x, author));
        });

        if (headerModel.Custodian != null) {
            x.documentElement.appendChild(headerBuilder.BuildCustodian(x, headerModel.Custodian));
        }

        x.documentElement.appendChild(headerBuilder.BuildLegalAuthenticator(x, headerModel.LegalAuthenticator));

        //the participants
        if (!_.isNull(headerModel.NextOfKin) && !_.isUndefined(headerModel.NextOfKin)) {
            newnode = cdaTools.BuildParticipant(x, headerModel.NextOfKin, "IND", "NOK");
            if (!_.isNull(newnode) && !_.isUndefined(newnode)) {
                x.documentElement.appendChild(newnode);
            }
        }

        if (!_.isNull(headerModel.PrimaryCareGiverAtHome) && !_.isUndefined(headerModel.PrimaryCareGiverAtHome)) {
            newnode = cdaTools.BuildParticipant(x, headerModel.PrimaryCareGiverAtHome, "IND", "CAREGIVER", "407543004", "2.16.840.1.113883.6.96", "Primary Carer", "SNOMED-CT");
            if (!_.isNull(newnode) && !_.isUndefined(newnode)) {
                x.documentElement.appendChild(newnode);
            }
        }

        if (!_.isNull(headerModel.ClinicianToContactWithQuestions) && !_.isUndefined(headerModel.ClinicianToContactWithQuestions)) {
            newnode = cdaTools.BuildParticipant(x, headerModel.ClinicianToContactWithQuestions, "CALLBCK", "ASSIGNED");
            if (!_.isNull(newnode) && !_.isUndefined(newnode)) {
                x.documentElement.appendChild(newnode);
            }
        }

        var serviceEvent = headerBuilder.BuildServiceEvent(x, headerModel.PrincipleCarePhysician, headerModel.CarePlanManager, headerModel.PrincipleHealthCareProvider,
            headerModel.PrincipleCareGiver, headerModel.OtherMembersOfCareTeam);

        if (serviceEvent != null) {
            x.documentElement.appendChild(serviceEvent);
        }


        //assembling the body
        //var problemBuilder = new self.ProblemsSection();
        var vitalBuilder = new self.VitalsSection();
        var functionalStatusBuilder = new self.FunctionalStatusSection();
        var immunizationBuilder = new self.ImmunizationSection();
        var allergyBuilder = new self.AllergySection();

        var body = 
            Σ(x, 'component',
                Σ(x, 'structuredBody',
                    //problemBuilder.BuildAll(documentModel.ProblemSection, x),
                    vitalBuilder.BuildAll(documentModel.VitalsSection, x),
                    functionalStatusBuilder.BuildAll(documentModel.FunctionalStatusSection, x),
                    immunizationBuilder.BuildAll(documentModel.ImmunizationSection, x),
                    allergyBuilder.BuildAll(documentModel.AllergiesSection, x)
            ));
        x.documentElement.appendChild(body);

        //these are text-only editable sections
        var textOnlySections = [
            "AdvanceDirectivesSection",
            "AssessmentSection",
            "ChiefComplaintSection",
            "EncounterSection",
            "FamilyHistorySection",
            "HistoryOfPresentIllnessSection",
            "HistoryOfPastIllnessSection",
            "HospitalDischargeDiagnosisSection",
            "MedicalEquipmentSection",
            "MedicationSection",
            "PayerSection",
            "PlanOfCareSection",
            "ProblemSection",
            "ProceduresSection",
            "ResultsSection",
            "PhysicalExamSection",
            "SocialHistorySection"];

        _.each(textOnlySections, function (section) {
            if (!_.isUndefined(documentModel[section])) {                
                body.childNodes[0].appendChild(buildGenericSection(x, documentModel[section], section));
            } 
        });

        //insert sections we can't process, but retained into the output
        _.each(documentModel.OtherSections, function(section){
            var xml=new DOMParser().parseFromString(section,"text/xml");

            body.childNodes[0].appendChild(xml.childNodes[0]);
        });

        return x;
    }

    return this;
})();