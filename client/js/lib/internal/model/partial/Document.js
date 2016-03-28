/// <reference path="../../../external/underscore/underscore.js" />
SEE.namespace("SEE.model.dto");
SEE.model.dto.Document.prototype.init = function () {
    SEE.model.BaseModel.prototype.init.call(this);

    var self = this;

    self.AdvanceDirectivesSection.ParentPropertyName = "AdvanceDirectivesSection";
    self.AdvanceDirectivesSection.Title = "ADVANCE DIRECTIVES";

    self.AllergiesSection.ParentPropertyName = "AllergiesSection";
    self.AllergiesSection.Title = "ALLERGIES, ADVERSE REACTIONS, ALERTS";

    self.AssessmentSection.ParentPropertyName = "AssessmentSection";
    self.AssessmentSection.Title = "ASSESSMENTS";

    self.ChiefComplaintSection.ParentPropertyName = "ChiefComplaintSection";
    self.ChiefComplaintSection.Title = "CHIEF COMPLAINT(S) AND REASON FOR VISIT";

    self.EncounterSection.ParentPropertyName = "EncounterSection";
    self.EncounterSection.Title = "ENCOUNTERS";

    self.FamilyHistorySection.ParentPropertyName = "FamilyHistorySection";
    self.FamilyHistorySection.Title = "FAMILY HISTORY";

    self.HistoryOfPresentIllnessSection.ParentPropertyName = "HistoryOfPresentIllnessSection";
    self.HistoryOfPresentIllnessSection.Title = "HISTORY OF PRESENT ILLNESS";

    self.HistoryOfPastIllnessSection.ParentPropertyName = "HistoryOfPastIllnessSection";
    self.HistoryOfPastIllnessSection.Title = "HISTORY OF PAST ILLNESS";

    self.HospitalDischargeDiagnosisSection.ParentPropertyName = "HospitalDischargeDiagnosisSection";
    self.HospitalDischargeDiagnosisSection.Title = "HOSPITAL DISCHARGE DIAGNOSIS";

    self.ImmunizationSection.ParentPropertyName = "ImmunizationSection";
    self.ImmunizationSection.Title = "IMMUNIZATIONS";

    self.MedicalEquipmentSection.ParentPropertyName = "MedicalEquipmentSection";
    self.MedicalEquipmentSection.Title = "MEDICAL EQUIPMENT";

    self.PhysicalExamSection.ParentPropertyName = "PhysicalExamSection";
    self.PhysicalExamSection.Title = "PHYSICAL EXAM";

    self.MedicationSection.ParentPropertyName = "MedicationSection";
    self.MedicationSection.Title = "MEDICATIONS";

    self.PayerSection.ParentPropertyName = "PayerSection";
    self.PayerSection.Title = "PAYERS";

    self.PlanOfCareSection.ParentPropertyName = "PlanOfCareSection";
    self.PlanOfCareSection.Title = "PLAN OF CARE";

    self.ProceduresSection.ParentPropertyName = "ProceduresSection";
    self.ProceduresSection.Title = "PROCEDURES";

    self.ResultsSection.ParentPropertyName = "ResultsSection";
    self.ResultsSection.Title = "RESULTS";

    self.SocialHistorySection.ParentPropertyName = "SocialHistorySection";
    self.SocialHistorySection.Title = "SOCIAL HISTORY";
};