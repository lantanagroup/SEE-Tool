SEE.namespace("SEE.model");
// -- psuedo dictionary object mapping the document section property name (Model/Document.js) to the SectionCode enum (Model/Enum/enum.js)
SEE.model.DocumentSectionToSectionCode = {
    AdvanceDirectivesSection: { Enum: SEE.enum.SectionCode.ADVANCEDIRECTIVE, LoincCode: ['42348-3'], TemplateId: '2.16.840.1.113883.10.20.22.2.21', DocumentPropertyName: 'AdvanceDirectivesSection', Title: 'ADVANCE DIRECTIVES' },
    ChiefComplaintSection: { Enum: SEE.enum.SectionCode.CHIEFCOMPLAINT, LoincCode: ['46239-0'], TemplateId: '2.16.840.1.113883.10.20.22.2.13', DocumentPropertyName: 'ChiefComplaintSection', Title: 'CHIEF COMPLAINT(S) AND REASON FOR VISIT' },
    HistoryOfPresentIllnessSection: { Enum: SEE.enum.SectionCode.HISTORYOFPRESENTILLNESS, LoincCode: ['10164-2'], TemplateId: '1.3.6.1.4.1.19376.1.5.3.1.3.4', DocumentPropertyName: 'HistoryOfPresentIllnessSection', Title: 'HISTORY OF PRESENT ILLNESS' },
    EncounterSection: { Enum: SEE.enum.SectionCode.ENCOUNTERS, LoincCode: ['46240-8'], TemplateId: '2.16.840.1.113883.10.20.22.2.22', DocumentPropertyName: 'EncounterSection', Title: 'ENCOUNTERS' },
    ProblemSection: { Enum: SEE.enum.SectionCode.PROBLEM, LoincCode: ['11450-4'], TemplateId: '2.16.840.1.113883.10.20.22.2.5', DocumentPropertyName: 'ProblemSection', Title: 'PROBLEMS, HEALTH CONCERNS' },
    HistoryOfPastIllnessSection: { Enum: SEE.enum.SectionCode.HISTORYOFPASTILLNESS, LoincCode: ['11348-0'], TemplateId: '2.16.840.1.113883.10.20.22.2.20', DocumentPropertyName: 'HistoryOfPastIllnessSection', Title: 'HISTORY OF PAST ILLNESS' },
    FamilyHistorySection: { Enum: SEE.enum.SectionCode.FAMILYHISTORY, LoincCode: ['10157-6'], TemplateId: '2.16.840.1.113883.10.20.22.2.15', DocumentPropertyName: 'FamilyHistorySection', Title: 'FAMILY HISTORY' },
    SocialHistorySection: { Enum: SEE.enum.SectionCode.SOCIALHISTORY, LoincCode: ['29762-2'], TemplateId: '2.16.840.1.113883.10.20.22.2.17', DocumentPropertyName: 'SocialHistorySection', Title: 'SOCIAL HISTORY/RISKS' },
    AllergiesSection: { Enum: SEE.enum.SectionCode.ALLERGIES, LoincCode: ['48765-2'], TemplateId: '2.16.840.1.113883.10.20.22.2.6', DocumentPropertyName: 'AllergiesSection', Title: 'ALLERGIES & ADVERSE REACTIONS' },
    MedicationSection: { Enum: SEE.enum.SectionCode.MEDICATION, LoincCode: ['10160-0'], TemplateId: '2.16.840.1.113883.10.20.22.2.1', DocumentPropertyName: 'MedicationSection', Title: 'MEDICATIONS' },
    ImmunizationSection: { Enum: SEE.enum.SectionCode.IMMUNIZATION, LoincCode: ['11369-6'], TemplateId: '2.16.840.1.113883.10.20.22.2.2', DocumentPropertyName: 'ImmunizationSection', Title: 'IMMUNIZATIONS' },
    MedicalEquipmentSection: { Enum: SEE.enum.SectionCode.MEDICALEQUIPMENT, LoincCode: ['46264-8'], TemplateId: '2.16.840.1.113883.10.20.22.2.23', DocumentPropertyName: 'MedicalEquipmentSection', Title: 'MEDICAL EQUIPMENT' },
    VitalsSection: { Enum: SEE.enum.SectionCode.VITAL, LoincCode: ['8716-3'], TemplateId: '2.16.840.1.113883.10.20.22.2.4', DocumentPropertyName: 'VitalsSection', Title: 'VITAL SIGNS' },
    PhysicalSection: { Enum: SEE.enum.SectionCode.PHYSICALEXAM, LoincCode: ['29545-1'], TemplateId: '2.16.840.1.113883.10.20.2.10', DocumentPropertyName: 'PhysicalExamSection', Title: 'PHYSICAL EXAM' },
    FunctionalStatusSection: { Enum: SEE.enum.SectionCode.FUNCTIONALSTATUS, LoincCode: ['47420-5'], TemplateId: '2.16.840.1.113883.10.20.22.2.14', DocumentPropertyName: 'FunctionalStatusSection', Title: 'FUNCTIONAL STATUS' },
    ProceduresSection: { Enum: SEE.enum.SectionCode.PROCEDURES, LoincCode: ['47519-4'], TemplateId: '2.16.840.1.113883.10.20.22.2.7', DocumentPropertyName: 'ProceduresSection', Title: 'PROCEDURES' },
    ResultsSection: { Enum: SEE.enum.SectionCode.RESULTS, LoincCode: ['30954-2'], TemplateId: '2.16.840.1.113883.10.20.22.2.3', DocumentPropertyName: 'ResultsSection', Title: 'RESULTS' },
    AssessmentSection: { Enum: SEE.enum.SectionCode.ASSESSMENT, LoincCode: ['51848-0'], TemplateId: '2.16.840.1.113883.10.20.22.2.8', DocumentPropertyName: 'AssessmentSection', Title: 'ASSESSMENT' },
    HospitalDischargeDiagnosisSection: { Enum: SEE.enum.SectionCode.HOSPITALDISCHARGEDIAGNOSIS, LoincCode: ['11535-2'], TemplateId: '2.16.840.1.113883.10.20.22.2.24', DocumentPropertyName: 'HospitalDischargeDiagnosisSection', Title: 'DISCHARGE DIAGNOSIS' },
    PlanOfCareSection: { Enum: SEE.enum.SectionCode.PLANOFCARE, LoincCode: ['18776-5'], TemplateId: '2.16.840.1.113883.10.20.22.2.10', DocumentPropertyName: 'PlanOfCareSection', Title: 'CARE PLAN' },
    PayerSection: { Enum: SEE.enum.SectionCode.PAYERS, LoincCode: ['48768-6'], TemplateId: '2.16.840.1.113883.10.20.22.2.18', DocumentPropertyName: 'PayerSection', Title: 'PAYERS' },

    requiredSections: function () {
        var sections = [];
        for (p in this) {
            if (_.isObject(this[p]) && this[p].DocumentPropertyName && this[p].TemplateId) {
                sections.push(this[p]);
            }
        }
        return sections;
    },

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
    },

    createSectionViewModel: function (mapEntry) {
        if (_.isString(mapEntry)) {
            mapEntry = SEE.model.DocumentSectionToSectionCode.findSection('DocumentPropertyName', mapEntry);
        }

        var newsection, documentPropertyName = mapEntry.DocumentPropertyName;

        if (documentPropertyName == "AdvanceDirectivesSection") {
            newsection = new SEE.viewmodel.document.section.AdvanceDirectivesSectionViewModel();
        } else if (documentPropertyName == "AllergiesSection") {
            newsection = new SEE.viewmodel.document.section.AllergySectionViewModel();
        } else if (documentPropertyName == "EncounterSection") {
            newsection = new SEE.viewmodel.document.section.HistoryOfEncountersViewModel();
        } else if (documentPropertyName == "FunctionalStatusSection") {
            newsection = new SEE.viewmodel.document.section.FunctionalStatusViewModel();
        } else if (documentPropertyName == "HistoryOfPastIllnessSection") {
            newsection = new SEE.viewmodel.document.section.PastIllnessSectionViewModel();
        } else if (documentPropertyName == "HospitalDischargeDiagnosisSection") {
            newsection = new SEE.viewmodel.document.section.DischargeDiagnosisSectionViewModel();
        } else if (documentPropertyName == "ImmunizationSection") {
            newsection = new SEE.viewmodel.document.section.ImmunizationSectionViewModel();
        } else if (documentPropertyName == "MedicalEquipmentSection") {
            newsection = new SEE.viewmodel.document.section.MedicalEquipmentSectionViewModel();
        } else if (documentPropertyName == "MedicationSection") {
            newsection = new SEE.viewmodel.document.section.MedicationSectionViewModel();
        } else if (documentPropertyName == "PayerSection") {
            newsection = new SEE.viewmodel.document.section.PayerSectionViewModel();
        } else if (documentPropertyName == "PlanOfCareSection") {
            newsection = new SEE.viewmodel.document.section.PlanOfCareSectionViewModel();
        } else if (documentPropertyName == "ProblemSection") {
            newsection = new SEE.viewmodel.document.section.ProblemSectionViewModel();
        } else if (documentPropertyName == "ProceduresSection") {
            newsection = new SEE.viewmodel.document.section.ProcedureSectionViewModel();
        } else if (documentPropertyName == "ResultsSection") {
            newsection = new SEE.viewmodel.document.section.LabResultsSectionViewModel();
        } else if (documentPropertyName == "SocialHistorySection") {
            newsection = new SEE.viewmodel.document.section.SocialHistorySectionViewModel();
        } else if (documentPropertyName == "VitalsSection") {
            newsection = new SEE.viewmodel.document.section.VitalsSectionViewModel();
        } else {
            newsection = new SEE.viewmodel.document.section.DocumentSectionViewModel();
        }
        newsection.ParentPropertyName = mapEntry.DocumentPropertyName;
        newsection.Title(mapEntry.Title);

        return newsection;
    }
};