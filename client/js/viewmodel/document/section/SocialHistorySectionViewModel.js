SEE.namespace("SEE.viewmodel.document.section");

SEE.viewmodel.document.section.SocialHistorySectionViewModel = function () {
    SEE.viewmodel.document.section.BaseDocumentSection.prototype.init.call(this);

    var self = this;

    self.Title("SOCIAL HISTORY");
    self.UI.EditTemplateName("document/section/SocialHistorySection.html");
    self.Entity = ko.observable(new SEE.model.dto.SocialHistorySection());
    self.smokingStatuses = ko.observableArray([]);
    self.selectedSmokingStatus = ko.observable();
    
    self.LoadEntity = function (document) {
        //call base object
        SEE.viewmodel.document.section.BaseDocumentSection.prototype.LoadEntity.call(self, document);

        var smokingStatus = ko.utils.arrayFirst(self.smokingStatuses(), function (s) {
            return s.SnomedCode == self.Entity().Smoking().SnomedCode();
        });

        self.selectedSmokingStatus(smokingStatus);


    };

    self.OnAfterRender = function () {
        self.selectedSmokingStatus.subscribe(function (newValue) {
            self.Entity().Smoking(newValue);
        });

        self.Entity().PatientLikesDislikes.subscribe(function (newValue) {
            self.DoGenerateText();
        });
        self.Entity().PatientExpectations.subscribe(function (newValue) {
            self.DoGenerateText();
        });
        self.Entity().ReligiousCulturalIssues.subscribe(function (newValue) {
            self.DoGenerateText();
        });;
        self.Entity().InadequateCommunitySupport.subscribe(function (newValue) {
            self.DoGenerateText();
        });
        self.Entity().FamilyNotInvolvedInCare.subscribe(function (newValue) {
            self.DoGenerateText();
        });
        self.Entity().Smoking.subscribe(function (newValue) {
            self.DoGenerateText();
        });
        self.Entity().Alcohol.subscribe(function (newValue) {
            self.DoGenerateText();
        });
        self.Entity().DrugUse.subscribe(function (newValue) {
            self.DoGenerateText();
        });
        self.Entity().LifetimeRadiationExposure.subscribe(function (newValue) {
            self.DoGenerateText();
        });
        self.Entity().RiskySexualBehavior.subscribe(function (newValue) {
            self.DoGenerateText();
        });
        self.Entity().WorkplaceExposures.subscribe(function (newValue) {
            self.DoGenerateText();
        });
        self.Entity().OtherExposures.subscribe(function (newValue) {
            self.DoGenerateText();
        });
        self.Entity().HousingStatus.subscribe(function (newValue) {
            self.DoGenerateText();
        });
        self.Entity().LivingArrangement.subscribe(function (newValue) {
            self.DoGenerateText();
        });
        self.Entity().Readmission.subscribe(function (newValue) {
            self.DoGenerateText();
        });
        self.Entity().Skin.subscribe(function (newValue) {
            self.DoGenerateText();
        });
        self.Entity().Falls.subscribe(function (newValue) {
            self.DoGenerateText();
        });
        self.Entity().MedError.subscribe(function (newValue) {
            self.DoGenerateText();
        });
        self.Entity().CarePlanFailure.subscribe(function (newValue) {
            self.DoGenerateText();
        });
        self.Entity().EnvironmentalFactors.subscribe(function (newValue) {
            self.DoGenerateText();
        });
        self.Entity().EnvironmentalRisksDecisionModifiers.subscribe(function (newValue) {
            self.DoGenerateText();
        });
        self.Entity().LastHospitalAdmission.subscribe(function (newValue) {
            self.DoGenerateText();
        });
        self.Entity().HomeSupports.subscribe(function (newValue) {
            self.DoGenerateText();
        });
        self.Entity().Transportation.subscribe(function (newValue) {
            self.DoGenerateText();
        });
    };

    self.SaveEntity = function (document) {
        self.DoGenerateText();

        self.Entity().Author(SEE.util.convertUserToAuthor(SEE.session.User));

        //call base class
        SEE.viewmodel.document.section.BaseDocumentSection.prototype.SaveEntity.call(self, document);
    };

    self.DoGenerateText = function () {
        var history1 = [];

        if (self.Entity().PatientLikesDislikes()) {
            history1.push("Patient likes and dislikes: " + self.Entity().PatientLikesDislikes());
        }
        if (self.Entity().PatientExpectations()) {
            history1.push("Patient expectations: " + self.Entity().PatientExpectations());
        }
        if (self.Entity().ReligiousCulturalIssues()) {
            history1.push("Religious/Cultural issues: " + self.Entity().ReligiousCulturalIssues());
        }
        if (self.Entity().InadequateCommunitySupport()) {
            history1.push("Needs assessment of community support");
        }
        if (self.Entity().FamilyNotInvolvedInCare()) {
            history1.push("Needs assessment of family involvement in care");
        }

        var doc = $("<root/>");

        if (history1.length > 0) {
            var historyList = SEE.util.xml.BuildHtmlList(history1);
            var title = $("<h4/>");
            title.text("Social History");
            doc.append(title);
            doc.append(historyList);
        }

        var history2 = [];
        if (self.Entity().Smoking()) {
            history2.push("Smoking: " + self.Entity().SmokingStatusName());
        }
        if (self.Entity().Alcohol()) {
            history2.push("Alcohol: " + self.Entity().Alcohol());
        }
        if (self.Entity().DrugUse()) {
            history2.push("Illicit substance abuse: " + self.Entity().DrugUse());
        }
        if (self.Entity().LifetimeRadiationExposure()) {
            history2.push("Lifetime radiation exposure: " + self.Entity().LifetimeRadiationExposure());
        }
        if (self.Entity().RiskySexualBehavior()) {
            history2.push("Risky sexual behavior: " + self.Entity().RiskySexualBehavior());
        }
        if (self.Entity().WorkplaceExposures()) {
            history2.push("Workplace exposures: " + self.Entity().WorkplaceExposures());
        }
        if (self.Entity().OtherExposures()) {
            history2.push("Other exposures: " + self.Entity().OtherExposures());
        }

        if (history2.length > 0) {
            var historyList = SEE.util.xml.BuildHtmlList(history2);
            var title = $("<h4/>");
            title.text("Exposure");
            doc.append(title);
            doc.append(historyList);
        }

        var history3 = [];
        if (self.Entity().HousingStatus()) {
            history3.push("Housing status: " + self.Entity().HousingStatus());
        }
        if (self.Entity().LivingArrangement()) {
            var text;
            switch (self.Entity().LivingArrangement()) {
                case "A":
                    text = "Lives alone";
                    break;
                case "F":
                    text = "Lives with family";
                    break;
                case "U":
                    text = "Unknown";
                    break;                    
            }
            history3.push("Living arrangement: " + text);
        }

        if (history3.length > 0) {
            var historyList = SEE.util.xml.BuildHtmlList(history3);
            var title = $("<h4/>");
            title.text("Living Situation");
            doc.append(title);
            doc.append(historyList);
        }

        var history4 = [];
        if (self.Entity().Readmission()) {
            history4.push("Readmission: " + self.Entity().Readmission());
        }
        if (self.Entity().Skin()) {
            history4.push("Skin: " + self.Entity().Skin());
        }
        if (self.Entity().Falls()) {
            history4.push("Falls: " + self.Entity().Falls());
        }
        if (self.Entity().MedError()) {
            history4.push("Med Error: " + self.Entity().MedError());
        }
        if (self.Entity().CarePlanFailure()) {
            history4.push("Care Plan Failure: " + self.Entity().CarePlanFailure());
        }

        if (history4.length > 0) {
            var historyList = SEE.util.xml.BuildHtmlList(history4);
            var title = $("<h4/>");
            title.text("Updated Risk Scores");
            doc.append(title);
            doc.append(historyList);
        }

        var history5 = [];
        if (self.Entity().EnvironmentalFactors()) {
            history5.push("Environmental actors: " + self.Entity().EnvironmentalFactors());
        }
        if (self.Entity().EnvironmentalRisksDecisionModifiers()) {
            history5.push("Environmental Risks and Decision Modifiers: " + self.Entity().EnvironmentalRisksDecisionModifiers());
        }
        if (self.Entity().LastHospitalAdmission()) {
            history5.push("Last hospital admission: " + self.Entity().LastHospitalAdmission());
        }
        if (self.Entity().HomeSupports()) {
            history5.push("Home supports: " + self.Entity().HomeSupports());
        }
        if (self.Entity().Transportation()) {
            history5.push("Transportation: " + self.Entity().Transportation());
        }

        if (history5.length > 0) {
            var historyList = SEE.util.xml.BuildHtmlList(history5);
            var title = $("<h4/>");
            title.text("Environmental Risks and Decision Modifiers");
            doc.append(title);
            doc.append(historyList);
        }

        var html = doc.html();

        if (history1.length || history2.length || history3.length || history4.length || history5.length) {
            self.Entity().GeneratedNarrative(html);
        } else {
            self.Entity().GeneratedNarrative("");
        }
    };
};

SEE.viewmodel.document.section.SocialHistorySectionViewModel.inheritsFrom(SEE.viewmodel.document.section.BaseDocumentSection);