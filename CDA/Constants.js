var _ = require("underscore"),
    SectionCode = require("../Model/Enum/enum.js").SectionCode;


exports.CONSTANTS = (function () {
    this.LOINC = {};
    this.LOINC.CODESYSTEM = '2.16.840.1.113883.6.1';
    this.LOINC.HEIGHT = '8302-2';
    this.LOINC.WEIGHT_MEASURED = '3141-9';
    this.LOINC.BP_SYSTOLIC = '8480-6';
    this.LOINC.BP_DIASTOLIC = '8462-4';
    this.LOINC.HEART_RATE = '8867-4';
    this.LOINC.RESPIRATORY_RATE = '9279-1';
    this.LOINC.PULSE = 'temp-pulse-code';
    this.LOINC.O2 = '2710-2';
    this.LOINC.TEMPERATURE = '8310-5';
    this.LOINC.BMI = '39156-5';
    this.LOINC.BODY_WEIGHT = '29463-7';

    this.MAP = {};
    // -- psuedo dictionary object mapping the document section property name (Model/Document.js) to the SectionCode enum (Model/Enum/enum.js)
    this.MAP.DocumentSectionToSectionCode = {        
        AdvanceDirectivesSection: { Enum: SectionCode.ADVANCEDIRECTIVE, LoincCode: ['42348-3'], TemplateId: '2.16.840.1.113883.10.20.22.2.21', DocumentPropertyName: 'AdvanceDirectivesSection', Title: 'ADVANCE DIRECTIVES' },
        AllergiesSection: { Enum: SectionCode.ALLERGIES, LoincCode: ['48765-2'], TemplateId: '2.16.840.1.113883.10.20.22.2.6', DocumentPropertyName: 'AllergiesSection', Title: 'ALLERGIES, ADVERSE REACTIONS, ALERTS' },
        AssessmentSection: { Enum: SectionCode.ASSESSMENT, LoincCode: ['51848-0'], TemplateId: '2.16.840.1.113883.10.20.22.2.8', DocumentPropertyName: 'AssessmentSection', Title: 'ASSESSMENTS' },
        PhysicalSection: { Enum: SectionCode.PHYSICALEXAM, LoincCode: ['29545-1'], TemplateId: '2.16.840.1.113883.10.20.2.10', DocumentPropertyName: 'PhysicalExamSection', Title: 'PHYSICAL EXAM' },
        ChiefComplaintSection: { Enum: SectionCode.CHIEFCOMPLAINT, LoincCode: ['46239-0'], TemplateId: '2.16.840.1.113883.10.20.22.2.13', DocumentPropertyName: 'ChiefComplaintSection', Title: 'CHIEF COMPLAINT(S) AND REASON FOR VISIT' },
        EncounterSection: { Enum: SectionCode.ENCOUNTERS, LoincCode: ['46240-8'], TemplateId: '2.16.840.1.113883.10.20.22.2.22', DocumentPropertyName: 'EncounterSection', Title: 'ENCOUNTERS' },
        FamilyHistorySection: { Enum: SectionCode.FAMILYHISTORY, LoincCode: ['10157-6'], TemplateId: '2.16.840.1.113883.10.20.22.2.15', DocumentPropertyName: 'FamilyHistorySection', Title: 'FAMILY HISTORY' },
        FunctionalStatusSection: { Enum: SectionCode.FUNCTIONALSTATUS, LoincCode: ['47420-5'], TemplateId: '2.16.840.1.113883.10.20.22.2.14', DocumentPropertyName: 'FunctionalStatusSection', Title: 'FUNCTIONAL STATUS' },
        HistoryOfPresentIllnessSection: { Enum: SectionCode.HISTORYOFPRESENTILLNESS, LoincCode: ['10164-2'], TemplateId: '1.3.6.1.4.1.19376.1.5.3.1.3.4', DocumentPropertyName: 'HistoryOfPresentIllnessSection', Title: 'HISTORY OF PRESENT ILLNESS' },
        HistoryOfPastIllnessSection: { Enum: SectionCode.HISTORYOFPASTILLNESS, LoincCode: ['11348-0'], TemplateId: '2.16.840.1.113883.10.20.22.2.20', DocumentPropertyName: 'HistoryOfPastIllnessSection', Title: 'HISTORY OF PAST ILLNESS'  },
        HospitalDischargeDiagnosisSection: { Enum: SectionCode.HOSPITALDISCHARGEDIAGNOSIS, LoincCode: ['11535-2'], TemplateId: '2.16.840.1.113883.10.20.22.2.24', DocumentPropertyName: 'HospitalDischargeDiagnosisSection', Title: 'HOSPITAL DISCHARGE DIAGNOSIS' },
        ImmunizationSection: { Enum: SectionCode.IMMUNIZATION, LoincCode: ['11369-6'], TemplateId: '2.16.840.1.113883.10.20.22.2.2', DocumentPropertyName: 'ImmunizationSection', Title: 'IMMUNIZATIONS' },
        MedicalEquipmentSection: { Enum: SectionCode.MEDICALEQUIPMENT, LoincCode: ['46264-8'], TemplateId: '2.16.840.1.113883.10.20.22.2.23', DocumentPropertyName: 'MedicalEquipmentSection', Title: 'MEDICAL EQUIPMENT' },
        MedicationSection: { Enum: SectionCode.MEDICATION, LoincCode: ['10160-0'], TemplateId: '2.16.840.1.113883.10.20.22.2.1', DocumentPropertyName: 'MedicationSection', Title: 'MEDICATIONS' },
        PayerSection: { Enum: SectionCode.PAYERS, LoincCode: ['48768-6'], TemplateId: '2.16.840.1.113883.10.20.22.2.18', DocumentPropertyName: 'PayerSection', Title: 'PAYERS' },
        PlanOfCareSection: { Enum: SectionCode.PLANOFCARE, LoincCode: ['18776-5'], TemplateId: '2.16.840.1.113883.10.20.22.2.10', DocumentPropertyName: 'PlanOfCareSection', Title: 'PLAN OF CARE' },
        ProblemSection: { Enum: SectionCode.PROBLEM, LoincCode: ['11450-4'], TemplateId: '2.16.840.1.113883.10.20.22.2.5', DocumentPropertyName: 'ProblemSection', Title: 'FUNCTIONAL STATUS' },
        ProceduresSection: { Enum: SectionCode.PROCEDURES, LoincCode: ['47519-4'], TemplateId: '2.16.840.1.113883.10.20.22.2.7', DocumentPropertyName: 'ProceduresSection', Title: 'PROCEDURES' },
        ResultsSection: { Enum: SectionCode.RESULTS, LoincCode: ['30954-2'], TemplateId: '2.16.840.1.113883.10.20.22.2.3', DocumentPropertyName: 'ResultsSection', Title: 'RESULTS' },
        SocialHistorySection: { Enum: SectionCode.SOCIALHISTORY, LoincCode: ['29762-2'], TemplateId: '2.16.840.1.113883.10.20.22.2.17', DocumentPropertyName: 'SocialHistorySection', Title: 'SOCIAL HISTORY' },
        VitalsSection: { Enum: SectionCode.VITAL, LoincCode: ['8716-3'], TemplateId: '2.16.840.1.113883.10.20.22.2.4', DocumentPropertyName: 'VitalsSection', Title: 'VITAL SIGNS' },

        findSection: function (field, fieldValue) {
            var target;
            for (var p in this) {
                if (!_.isUndefined(this[p][field])) {
                    if (_.isArray(this[p][field])) {
                        target = _.find(this[p][field], function (value) {
                            return value === fieldValue;
                        });
                    }
                    else {
                        target = this[p][field];
                    }
                }

                if (target === fieldValue) {
                    return this[p];
                }
            }
            return null;
        }
    
    };

    return this;
})();