
//+++++++++++++++++++ WARNING ++++++++++++++++++++++++++s
// This file was generated by a tool. DO NOT HAND EDIT!
//++++++++++++++++++++++++++++++++++++++++++++++++++++++
SEE.namespace("SEE.model.dto");
SEE.model.dto.map = {
	'SEE.model.dto.DocumentInfo' : { 
		'include': [  'Title' , 'DateCreated' , 'DateModified' , 'Patient' , 'DocumentType' , 'Status' , 'Authors' , 'GroupIdentifier' , 'Header' , 'History' , 'OtherDocumentIdentificationMetadata']},
	'SEE.model.dto.Document' : { 
		'include': [  'CdaXmlDocument' , 'DocumentInfo' , 'ProblemSection' , 'VitalsSection' , 'MedicationSection' , 'AdvanceDirectivesSection' , 'AllergiesSection' , 'AssessmentSection' , 'PhysicalExamSection' , 'ChiefComplaintSection' , 'EncounterSection' , 'FamilyHistorySection' , 'FunctionalStatusSection' , 'HistoryOfPresentIllnessSection' , 'HistoryOfPastIllnessSection' , 'HospitalDischargeDiagnosisSection' , 'ImmunizationSection' , 'MedicalEquipmentSection' , 'PayerSection' , 'PlanOfCareSection' , 'ProceduresSection' , 'ResultsSection' , 'SocialHistorySection' , 'OtherSections']},
	'SEE.model.dto.CdaXmlDocument' : { 
		'include': [  'Xml']},
	'SEE.model.dto.User' : { 
		'include': [  'UserName' , 'MRU' , 'GroupIdentifier' , 'Mailbox' , 'csrfToken' , 'PersonInfo']},
	'SEE.model.dto.AssigningAuthorityListEntry' : { 
		'include': [  'GroupIdentifier' , 'Name' , 'Root']},
	'SEE.model.dto.DocumentSkeleton' : { 
		'include': [  'Xml' , 'Name']},
	'SEE.model.dto.Patient' : { 
		'include': [  'PersonInfo' , 'BirthTime' , 'GenderCode' , 'RaceCode' , 'EthnicityCode' , 'PrimaryLanguageCode' , 'OtherLanguageCode' , 'MaritalStatusCode' , 'ReligionCode']},
	'SEE.model.dto.PersonInfo' : { 
		'include': [  'StreetAddress' , 'City' , 'State' , 'ZipCode' , 'Country' , 'Phone' , 'AltPhone' , 'Pager' , 'Email' , 'NPI' , 'FirstName' , 'LastName' , 'Specialty' , 'RelationshipToPatient' , 'Identifiers']},
	'SEE.model.dto.OrganizationInfo' : { 
		'include': [  'Id' , 'StreetAddress' , 'City' , 'State' , 'ZipCode' , 'Phone' , 'AltPhone' , 'Email' , 'Name' , 'Identifiers']},
	'SEE.model.dto.ProblemSectionProblem' : { 
		'include': [  'id' , 'Author' , 'Name' , 'Code' , 'DateOfOnset' , 'ResolutionDate' , 'Diagnoser' , 'ClinicianToCall' , 'CurrentSeverity' , 'CurrentSeverityName' , 'WorstSeverity' , 'WorstSeverityName' , 'ProblemFindings']},
	'SEE.model.dto.ProblemFinding' : { 
		'include': [  'Name' , 'Code' , 'id']},
	'SEE.model.dto.SnomedProblem' : { 
		'include': [  'SNOMED_CID' , 'SNOMED_FSN' , 'SNOMED_CONCEPT_STATUS' , 'UMLS_CUI' , 'OCCURRENCE' , 'USAGE' , 'FIRST_IN_SUBSET' , 'IS_RETIRED_FROM_SUBSET' , 'LAST_IN_SUBSET' , 'REPLACED_BY_SNOMED_CID']},
	'SEE.model.dto.ProblemSection' : { 
		'include': [  'LifeThreateningConditionPresent' , 'DSM_AXIS_1' , 'DSM_AXIS_2' , 'DSM_AXIS_3' , 'DSM_AXIS_4' , 'Problems' , 'FreeNarrative' , 'GeneratedNarrative' , 'TransformedNarrative' , 'Title']},
	'SEE.model.dto.PayerSection' : { 
		'include': [  'PayerPolicies' , 'FreeNarrative' , 'GeneratedNarrative' , 'TransformedNarrative' , 'Author']},
	'SEE.model.dto.PayerPolicy' : { 
		'include': [  'id' , 'InsurerName' , 'InsurerPhone' , 'PolicyNumber' , 'InsuranceType' , 'MemberNumber' , 'PolicyDetails' , 'Guarantor' , 'Author']},
	'SEE.model.dto.ResultsSection' : { 
		'include': [  'LabResults' , 'OtherLabResults' , 'FreeNarrative' , 'GeneratedNarrative' , 'TransformedNarrative' , 'Author']},
	'SEE.model.dto.LabResult' : { 
		'include': [  'id' , 'Name' , 'Value' , 'Unit' , 'DateObserved' , 'Author']},
	'SEE.model.dto.EncountersSection' : { 
		'include': [  'NumberofEDVisits' , 'LastEDVisit' , 'FreeNarrative' , 'GeneratedNarrative' , 'TransformedNarrative' , 'Author']},
	'SEE.model.dto.Author' : { 
		'include': [  'FirstName' , 'LastName' , 'UserName']},
	'SEE.model.dto.VitalsSection' : { 
		'include': [  'Vitals' , 'FreeNarrative' , 'GeneratedNarrative' , 'TransformedNarrative']},
	'SEE.model.dto.VitalSignEntry' : { 
		'include': [  'id' , 'Author' , 'DateRecorded' , 'DateRecordedComment' , 'Height' , 'HeightUnit' , 'HeightComment' , 'Weight' , 'WeightUnit' , 'WeightComment' , 'BMI' , 'BMIComment' , 'SystolicBP' , 'SystolicBPComment' , 'DiastolicBP' , 'DiastolicBPComment' , 'HeartRate' , 'HeartRateComment' , 'RespiratoryRate' , 'RespiratoryRateComment' , 'HeartRhythmValue' , 'HeartRhythmComment' , 'O2Sat' , 'O2SatComment' , 'Temperature' , 'TemperatureUnit' , 'TemperatureComment' , 'HeartRhythmName' , 'HeartRhythmComment']},
	'SEE.model.dto.MedicationSection' : { 
		'include': [  'Medications' , 'MedicationExclusions' , 'FreeNarrative' , 'GeneratedNarrative' , 'TransformedNarrative']},
	'SEE.model.dto.MedicationEntry' : { 
		'include': [  'id' , 'Author' , 'DrugCode' , 'DrugName' , 'IndicationCode' , 'IndicationName' , 'Prescriber' , 'StartDate' , 'EndDate' , 'RouteCode' , 'RouteName' , 'Dose' , 'Frequency' , 'CurrentActive' , 'Preadmission' , 'Admission' , 'Discharge' , 'WarfarinTargetINR' , 'WarfarinPrescriberForDoseChanges' , 'WarfarinHasClinicianAgreedToManage' , 'WarfarinLast3Doses' , 'WarfarinRecommendedNextDose' , 'WarfarinTimingNextDose']},
	'SEE.model.dto.MedicationExclusionEntry' : { 
		'include': [  'id' , 'Author' , 'DrugCode' , 'DrugName' , 'IndicationCode' , 'IndicationName' , 'Prescriber']},
	'SEE.model.dto.FunctionalStatusSection' : { 
		'include': [  'Capabilities' , 'PainScales' , 'Cognitions' , 'DailyLivings' , 'SpecialAlerts' , 'GAFScore' , 'FreeNarrative' , 'GeneratedNarrative' , 'TransformedNarrative']},
	'SEE.model.dto.FunctionalStatusEntry' : { 
		'include': [  'id' , 'Author' , 'Name' , 'Value' , 'EffectiveTime']},
	'SEE.model.dto.FunctionalStatusPainScaleEntry' : { 
		'include': [  'id' , 'PainScore' , 'PainScoreEffectiveTime']},
	'SEE.model.dto.GenericSection' : { 
		'include': [  'Title' , 'ParentPropertyName' , 'FreeNarrative' , 'TransformedNarrative']},
	'SEE.model.dto.HeaderSection' : { 
		'include': [  'DocumentID' , 'EncounterTime' , 'DatePatientArrivedAtSendingSite' , 'SendingSite' , 'ClinicianToContactWithQuestions' , 'ReceivingSiteSentTo' , 'ConfidentialityCode' , 'Patient' , 'Authors' , 'NextOfKin' , 'PrimaryCareGiverAtHome' , 'Guardian' , 'PrincipleCarePhysician' , 'CarePlanManager' , 'PrincipleHealthCareProvider' , 'PrincipleCareGiver' , 'OtherMembersOfCareTeam' , 'Custodian']},
	'SEE.model.dto.SocialHistorySection' : { 
		'include': [  'Author' , 'PatientLikesDislikes' , 'PatientExpectations' , 'ReligiousCulturalIssues' , 'InadequateCommunitySupport' , 'FamilyNotInvolvedInCare' , 'Smoking' , 'Alcohol' , 'DrugUse' , 'LifetimeRadiationExposure' , 'RiskySexualBehavior' , 'WorkplaceExposures' , 'OtherExposures' , 'HousingStatus' , 'Readmission' , 'Skin' , 'Falls' , 'MedError' , 'CarePlanFailure' , 'EnvironmentalFactors' , 'EnvironmentalRisksDecisionModifiers' , 'LastHospitalAdmission' , 'HomeSupports' , 'Transportation' , 'LivingArrangement' , 'FreeNarrative' , 'GeneratedNarrative' , 'TransformedNarrative']},
	'SEE.model.dto.InstanceIdentifier' : { 
		'include': [  'Root' , 'Extension']},
	'SEE.model.dto.ImmunizationSection' : { 
		'include': [  'FreeNarrative' , 'GeneratedNarrative' , 'TransformedNarrative' , 'Immunizations']},
	'SEE.model.dto.ImmunizationEntry' : { 
		'include': [  'id' , 'Author' , 'Name' , 'Route' , 'Dose' , 'Details' , 'EffectiveTime']},
	'SEE.model.dto.AllergySection' : { 
		'include': [  'FreeNarrative' , 'GeneratedNarrative' , 'TransformedNarrative' , 'Allergies' , 'KnownAdverseEvents' , 'PotentialAdverseEvents']},
	'SEE.model.dto.AllergyEntry' : { 
		'include': [  'id' , 'Author' , 'AllergyType' , 'AllergyTo' , 'Severity' , 'Reaction' , 'NoticeDate']},
	'SEE.model.dto.AdvanceDirectivesEntry' : { 
		'include': [  'ProxyInvoked' , 'HCPCompetency' , 'Resuscitation' , 'MedicationOnlyNoCPR' , 'VentilationRespiratoryDistress' , 'MayUseIntubation' , 'NonInvasiveVentilation' , 'NonInvasiveVentilationLimitedTrial' , 'UseOralIMorIVAntibiotics' , 'UseOralAntibioticsOnly' , 'UseOralAntibioticsOnlySymptomRelief' , 'MedicationAny' , 'MedicationAnyForSymptomRelief' , 'MedicationPainReliefOnly' , 'TransfusionsAnyBloodProduct' , 'AllowHospitalTransferAny' , 'AllowHospitalTransferSevere' , 'AllowHospitalTransferNone' , 'MedicalTestsAny' , 'MedicalTestsLimited' , 'GiveChronicDialysis' , 'ArtificiallyAdministerFluids' , 'Other']},
	'SEE.model.dto.AdvanceDirectivesSection' : { 
		'include': [  'Author' , 'Directives' , 'PrimaryHealthCareAgent' , 'AlternateHealthCareAgent' , 'OtherContacts' , 'HealthcareProxyIsDifferent' , 'FreeNarrative' , 'GeneratedNarrative' , 'TransformedNarrative' , 'DateOfForm' , 'VersionNumber' , 'ExpirationDate' , 'SignedPatientAttestation' , 'SignedNPAttestation' , 'SignedMDAttestation' , 'AdvanceDirectiveDocument']},
	'SEE.model.dto.MedicalEquipmentSection' : { 
		'include': [  'MedicalEquipment' , 'Supplies' , 'FreeNarrative' , 'GeneratedNarrative' , 'TransformedNarrative' , 'Author']},
	'SEE.model.dto.MedicalEquipmentEntry' : { 
		'include': [  'Name' , 'Details' , 'EffectiveTime']},
	'SEE.model.dto.MedicalSupplyEntry' : { 
		'include': [  'What' , 'Where' , 'When' , 'SuppliesOrdered' , 'SuppliesSent' , 'EffectiveTime']},
	'SEE.model.dto.PastIllnessSection' : { 
		'include': [  'FreeNarrative' , 'GeneratedNarrative' , 'TransformedNarrative' , 'PastIllnesses']},
	'SEE.model.dto.PastIllnessEntry' : { 
		'include': [  'id' , 'Author' , 'Name' , 'ResolutionDate' , 'DateOfOnset' , 'CurrentSeverity' , 'WorstSeverity' , 'Diagnoser']},
	'SEE.model.dto.DischargeDiagnosisSection' : { 
		'include': [  'DischargeDiagnosis' , 'FreeNarrative' , 'GeneratedNarrative' , 'TransformedNarrative']},
	'SEE.model.dto.DischargeDiagnosisEntry' : { 
		'include': [  'id' , 'Author' , 'Name' , 'Code' , 'DateOfOnset' , 'ResolutionDate' , 'Diagnoser' , 'CurrentSeverity' , 'CurrentSeverityName' , 'WorstSeverity' , 'WorstSeverityName']},
	'SEE.model.dto.ProcedureSection' : { 
		'include': [  'FreeNarrative' , 'GeneratedNarrative' , 'TransformedNarrative' , 'ProcedureOrders' , 'CommonTreatments' , 'SpecializedTreatments' , 'OtherTreatments']},
	'SEE.model.dto.ProcedureOrderEntry' : { 
		'include': [  'id' , 'Author' , 'OrderId' , 'Name' , 'Orderer' , 'Amount' , 'Frequency' , 'Duration' , 'Outcome' , 'OrderDate' , 'StartChangeDate']},
	'SEE.model.dto.TreatmentEntry' : { 
		'include': [  'id' , 'Author' , 'Name' , 'Code' , 'Value' , 'EffectiveDate']},
	'SEE.model.dto.PlanOfCareSection' : { 
		'include': [  'Author' , 'ClinicalAssumingResponsibility' , 'ReceivedVerbalHandoff' , 'ShortTermGoals' , 'LongTermGoals' , 'ProblemSpecificGoals' , 'GoalWeight' , 'DailyWeightChecks' , 'Instructions' , 'HomecareSpecificIssues' , 'VersionNumber' , 'BasedOnVersionNumber' , 'BasedOnSections' , 'SignificantChanges' , 'ForSpecificTeamMembers' , 'ReconciledBy' , 'DateReconciled' , 'NurseReview' , 'PhysicianReview' , 'FreeNarrative' , 'GeneratedNarrative' , 'TransformedNarrative']},
	'SEE.model.dto.Goal' : { 
		'include': [  'DesiredOutcome' , 'Priority' , 'Details' , 'GoalDate']},
	'SEE.model.dto.ProblemSpecificGoal' : { 
		'include': [  'DesiredOutcome' , 'Milesones' , 'Barriers' , 'Progress' , 'GoalDate']},
	'SEE.model.dto.InstructionsAndFollowupPlans' : { 
		'include': [  'ProposedInterventions' , 'DegreeOfAcceptance' , 'DegreeOfDiagnosticUncertainty' , 'Perception' , 'ScheduledAppointments' , 'DischargeMedicationList' , 'RedFlags' , 'IdentifiedLearner' , 'SpecialDiet' , 'TestResultsPendingAtDischarge' , 'WhoFollowsUp' , 'ResultNumbers' , 'ExpectedOutcomes' , 'WoundCareSheetAttached' , 'WoundVACDressing' , 'WoundVACDressingSetting' , 'WoundVACDressingChanger' , 'WoundVACDressingFrequency' , 'WoundVACDressingTeachingMaterials']},
	'SEE.model.dto.HomecareSpecificIssues' : { 
		'include': [  'Address' , 'Homebound' , 'F2F' , 'SpecificConditionsRequiringIntervention' , 'StartOfCare' , 'VerbalOrdersIssued']},
	'SEE.model.dto.SectionLockInfo' : { 
		'include': [  'LockedBy' , 'LockTime' , 'Lock']},
	'SEE.model.dto.HistoryEvent' : { 
		'include': [  'Author' , 'Event' , 'SectionName' , 'SourceDocumentId' , 'SourceDocumentTitle' , 'TargetDocumentTitle' , 'TargetDocumentId' , 'EventTime' , 'EventDirection']},
	'SEE.model.dto.DocumentHistory' : { 
		'include': [  'HistoricalEvents' , 'NewEvents']},
	};