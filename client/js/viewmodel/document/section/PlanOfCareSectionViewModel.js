SEE.namespace("SEE.viewmodel.document.section");

SEE.viewmodel.document.section.PlanOfCareSectionViewModel = function () {
    SEE.viewmodel.document.section.BaseDocumentSection.prototype.init.call(this);

    var self = this;
    // var DATE_RANGE = "c-100:+10";

    self.Title("PLAN OF CARE");
    self.UI.EditTemplateName("document/section/PlanOfCareSection.html");
    self.Entity = ko.observable(new SEE.model.dto.PlanOfCareSection());
    self.ParentViewModel = null;
    self.HasLoaded = ko.observable(false);

    self.NewShortTermGoal = ko.observable(new SEE.model.dto.Goal());
    self.NewLongTermGoal = ko.observable(new SEE.model.dto.Goal());
    self.NewProblemSpecificGoal = ko.observable(new SEE.model.dto.ProblemSpecificGoal());
    self.NewWeightGoal = ko.observable(new SEE.model.dto.ProblemSpecificGoal());

    self.LoadEntity = function (document) {
        //call base object
        SEE.viewmodel.document.section.BaseDocumentSection.prototype.LoadEntity.call(self, document);
        self.HasLoaded(true);
        //self.Entity().Commit();
    };

    self.DoGenerateText = function () {

        var shortGoals = [];
        _.each(self.Entity().ShortTermGoals(), function (item, index) {
            var text = item.DesiredOutcome();

            if (item.Details()){text += " - " + item.Details();}
            if (item.GoalDate()){text += " (" +SEE.util.GetFormattedDate(item.GoalDate())+ ")";}

            shortGoals.push(text);
        });

        var longGoals = [];
        _.each(self.Entity().LongTermGoals(), function (item, index) {
            var text = item.DesiredOutcome();

            if (item.Details()){text += " - " + item.Details();}
            if (item.GoalDate()){text += " (" +SEE.util.GetFormattedDate(item.GoalDate())+ ")";}
            longGoals.push(text);
        });

        var problemGoalsList = $("<ul/>");
        var problemGoalsCount = 0;
        _.each(self.Entity().ProblemSpecificGoals(), function (item, index) {
            var listItem = $("<li/>");
            var sublist = $("<ul/>");

            listItem.text(item.DesiredOutcome());

            if (item.Milesones())
                sublist.append($("<li>Milestones: " +  item.Milesones() + "</li>"));

            if (item.Barriers())
                sublist.append($("<li>Barriers: " +  item.Barriers() + "</li>"));

            if (item.Progress())
                sublist.append($("<li>Progress: " +  item.Progress() + "</li>"));

            if (item.GoalDate())
                sublist.append($("<li>As Of: " +  SEE.util.GetFormattedDate(item.GoalDate()) + "</li>"));

            listItem.append(sublist);
            problemGoalsList.append(listItem);
            problemGoalsCount++;
        });

        var weightGoals = [];
        _.each(self.Entity().GoalWeight(), function (item, index) {
            var text = item.DesiredOutcome();

            if (item.GoalDate()){text += " (" +SEE.util.GetFormattedDate(item.GoalDate())+ ")";}

            weightGoals.push(text);
        });
        if (self.Entity().DailyWeightChecks()) {
            weightGoals.push("Daily weight checks: " + self.Entity().DailyWeightChecks());
        }

        var instructions = [];
        if (self.Entity().Instructions().ProposedInterventions()) {
            instructions.push("Proposed interventions and procedures for patient after: " + self.Entity().Instructions().ProposedInterventions());
        }
        if (self.Entity().Instructions().DegreeOfAcceptance()) {
            instructions.push("Degree of patient/family acceptance of therapy: " + self.Entity().Instructions().DegreeOfAcceptance());
        }
        if (self.Entity().Instructions().DegreeOfDiagnosticUncertainty()) {
            instructions.push("Degree of diagnostic uncertainty: " + self.Entity().Instructions().DegreeOfDiagnosticUncertainty());
        }
        if (self.Entity().Instructions().Perception()) {
            instructions.push("Perception of patient/family of adequacy of transition: " + self.Entity().Instructions().Perception());
        }
        if (self.Entity().Instructions().ScheduledAppointments()) {
            instructions.push("Scheduled appointments and tests: " + self.Entity().Instructions().ScheduledAppointments());
        }
        if (self.Entity().Instructions().DischargeMedicationList()) {
            instructions.push("Discharge medication list with explanation of changes: " + self.Entity().Instructions().DischargeMedicationList());
        }
        if (self.Entity().Instructions().RedFlags()) {
            instructions.push("Red flag warnings/parameters and expected action: " + self.Entity().Instructions().RedFlags());
        }
        if (self.Entity().Instructions().IdentifiedLearner()) {
            instructions.push("Identified Learner for education: " + self.Entity().Instructions().IdentifiedLearner());
        }

        if (self.Entity().Instructions().SpecialDiet()) {
            instructions.push("Special diet or consistency: " + self.Entity().Instructions().SpecialDiet());
        }
        if (self.Entity().Instructions().TestResultsPendingAtDischarge()) {
            instructions.push("Test results pending at discharge/transfer: " + self.Entity().Instructions().TestResultsPendingAtDischarge());
        }
        if (self.Entity().Instructions().WhoFollowsUp()) {
            instructions.push("Responsible for following up: " + self.Entity().Instructions().WhoFollowsUp());
        }
        if (self.Entity().Instructions().ResultNumbers()) {
            instructions.push("Number(s) to call for results: " + self.Entity().Instructions().ResultNumbers());
        }
        if (self.Entity().Instructions().ExpectedOutcomes()) {
            instructions.push("Expected outcomes: " + self.Entity().Instructions().ExpectedOutcomes());
        }


        var wounds = [];

        if (self.Entity().Instructions().WoundVACDressing()) {
            wounds.push("VAC Dressing: " + self.Entity().Instructions().WoundVACDressing());
        }
        if (self.Entity().Instructions().WoundVACDressingSetting()) {
            wounds.push("Setting: " + self.Entity().Instructions().WoundVACDressingSetting());
        }
        if (self.Entity().Instructions().WoundVACDressingChanger()) {
            wounds.push("Who will change dressing: " + self.Entity().Instructions().WoundVACDressingChanger());
        }

        if (self.Entity().Instructions().WoundVACDressingFrequency()) {
            wounds.push("Frequency: " + self.Entity().Instructions().WoundVACDressingFrequency());
        }

        if (self.Entity().Instructions().WoundVACDressingTeachingMaterials()) {
            wounds.push("Teaching materials used for patient/family: " + self.Entity().Instructions().WoundVACDressingTeachingMaterials());
        }

        var homeissues = [];
        if (self.Entity().HomecareSpecificIssues().Address()) {
            homeissues.push("Address where care is to be provided: " + self.Entity().HomecareSpecificIssues().Address());
        }
        if (self.Entity().HomecareSpecificIssues().Homebound()) {
            homeissues.push("Homebound - Medicare Certification");
        }
        if (self.Entity().HomecareSpecificIssues().F2F()) {
            homeissues.push("F2F - Medicare");
        }
        if (self.Entity().HomecareSpecificIssues().SpecificConditionsRequiringIntervention()) {
            homeissues.push("Specific conditions requiring home care intervention: " + self.Entity().HomecareSpecificIssues().SpecificConditionsRequiringIntervention());
        }
        if (self.Entity().HomecareSpecificIssues().StartOfCare()) {
            homeissues.push("Start of care: " + SEE.util.GetFormattedDate(self.Entity().HomecareSpecificIssues().StartOfCare()));
        }
        if (self.Entity().HomecareSpecificIssues().VerbalOrdersIssued()) {
            homeissues.push("Verbal order issued: " + SEE.util.GetFormattedDate(self.Entity().HomecareSpecificIssues().VerbalOrdersIssued()));
        }


        var plans = [];
        if (self.Entity().VersionNumber()) {
            plans.push("Version Number: " + self.Entity().VersionNumber());
        }
        if (self.Entity().BasedOnVersionNumber()) {
            plans.push("Based on Version: " + self.Entity().BasedOnVersionNumber());
        }
        if (self.Entity().BasedOnSections()) {
            plans.push("Which Sections: " + self.Entity().BasedOnSections());
        }
        if (self.Entity().SignificantChanges()) {
            plans.push("Significant Changes: " + self.Entity().SignificantChanges());
        }
        if (self.Entity().ForSpecificTeamMembers()) {
            plans.push("Specific Team Members: " + self.Entity().ForSpecificTeamMembers());
        }
        if (self.Entity().NurseReview()) {
            plans.push("Nurse review of plan: " + SEE.util.GetFormattedDate(self.Entity().NurseReview()));
        }
        if (self.Entity().PhysicianReview()) {
            plans.push("Physician review of plan: " + SEE.util.GetFormattedDate(self.Entity().PhysicianReview()));
        }
        if (self.Entity().ReconciledBy().LastName()) {
            plans.push("Reconciled By: " + self.Entity().ReconciledBy().FullName());
        }
        if (self.Entity().DateReconciled()) {
            plans.push("Date Reconciled: " + SEE.util.GetFormattedDate(self.Entity().DateReconciled()));
        }

        var shortGoalsList = SEE.util.xml.BuildHtmlList(shortGoals);
        var longGoalsList = SEE.util.xml.BuildHtmlList(longGoals);
        var weightGoalsList = SEE.util.xml.BuildHtmlList(weightGoals);
        var plansList = SEE.util.xml.BuildHtmlList(plans);
        var instructionsList = SEE.util.xml.BuildHtmlList(instructions);
        var homeIssuesList = SEE.util.xml.BuildHtmlList(homeissues);
        var woundsList = SEE.util.xml.BuildHtmlList(wounds);

        var doc = $("<root/>");

        if (self.Entity().ClinicalAssumingResponsibility().LastName()) {
            var text = $("<p/>");
            text.text("Clinician Assuming Responsibility: " + self.Entity().ClinicalAssumingResponsibility().FullName());
            doc.append(text);
        }
        if (self.Entity().ReceivedVerbalHandoff()) {
            var text = $("<p/>");
            text.text("Received Verbal Handoff");
            doc.append(text);
        }

        if (shortGoals.length > 0) {
            var title = $("<h4/>");
            title.text("Short Term Patient Goals");
            doc.append(title);
            doc.append(shortGoalsList);
        }
        if (longGoals.length > 0) {
            var title = $("<h4/>");
            title.text("Long Term Patient Goals");
            doc.append(title);
            doc.append(longGoalsList);
        }
        if (problemGoalsCount > 0) {
            var title = $("<h4/>");
            title.text("Problem Specific Goals");
            doc.append(title);
            doc.append(problemGoalsList);
        }
        if (weightGoals.length > 0) {
            var title = $("<h4/>");
            title.text("Weight Goals");
            doc.append(title);
            doc.append(weightGoalsList);
        }

        if (instructions.length > 0) {
            var title = $("<h4/>");
            title.text("Patient/Caregiver Instructions/Followup plans");
            doc.append(title);
            doc.append(instructionsList);
        }

        if (wounds.length > 0) {
            var title = $("<h4/>");
            title.text("Wound(s)");
            doc.append(title);

            if (self.Entity().Instructions().WoundCareSheetAttached()) {
                var text = $("<p/>");
                text.text("Wound care sheet is attached");
                doc.append(text);
            }
            doc.append(woundsList);
        }

        if (homeissues.length > 0) {
            var title = $("<h4/>");
            title.text("Home Care Specific Issues");
            doc.append(title);
            doc.append(homeIssuesList);
        }

        if (plans.length > 0) {
            var title = $("<h4/>");
            title.text("Care Plan");
            doc.append(title);
            doc.append(plansList);
        }

        var html = doc.html();
        self.Entity().GeneratedNarrative(html);
    };

    self.OnAfterRender = function () {

        self.Entity().ClinicalAssumingResponsibility().FirstName.subscribe(function (newValue) {
            self.DoGenerateText();
        });
        self.Entity().ClinicalAssumingResponsibility().LastName.subscribe(function (newValue) {
            self.DoGenerateText();
        });
        self.Entity().ReceivedVerbalHandoff.subscribe(function (newValue) {
            self.DoGenerateText();
        });
        self.Entity().ShortTermGoals.subscribe(function (newValue) {
            self.DoGenerateText();
        });
        self.Entity().LongTermGoals.subscribe(function (newValue) {
            self.DoGenerateText();
        });
        self.Entity().ProblemSpecificGoals.subscribe(function (newValue) {
            self.DoGenerateText();
        });
        self.Entity().GoalWeight.subscribe(function (newValue) {
            self.DoGenerateText();
        });
        self.Entity().Instructions().ProposedInterventions.subscribe(function (newValue) {
            self.DoGenerateText();
        });
        self.Entity().Instructions().DegreeOfAcceptance.subscribe(function (newValue) {
            self.DoGenerateText();
        });
        self.Entity().Instructions().DegreeOfDiagnosticUncertainty.subscribe(function (newValue) {
            self.DoGenerateText();
        });
        self.Entity().DailyWeightChecks.subscribe(function (newValue) {
            self.DoGenerateText();
        });
        self.Entity().Instructions().Perception.subscribe(function (newValue) {
            self.DoGenerateText();
        });
        self.Entity().Instructions().ScheduledAppointments.subscribe(function (newValue) {
            self.DoGenerateText();
        });
        self.Entity().Instructions().DischargeMedicationList.subscribe(function (newValue) {
            self.DoGenerateText();
        });
        self.Entity().Instructions().RedFlags.subscribe(function (newValue) {
            self.DoGenerateText();
        });
        self.Entity().Instructions().IdentifiedLearner.subscribe(function (newValue) {
            self.DoGenerateText();
        });


        self.Entity().Instructions().SpecialDiet.subscribe(function (newValue) {
            self.DoGenerateText();
        });
        self.Entity().Instructions().TestResultsPendingAtDischarge.subscribe(function (newValue) {
            self.DoGenerateText();
        });
        self.Entity().Instructions().WhoFollowsUp.subscribe(function (newValue) {
            self.DoGenerateText();
        });
        self.Entity().Instructions().ResultNumbers.subscribe(function (newValue) {
            self.DoGenerateText();
        });
        self.Entity().Instructions().ExpectedOutcomes.subscribe(function (newValue) {
            self.DoGenerateText();
        });
        self.Entity().Instructions().WoundCareSheetAttached.subscribe(function (newValue) {
            self.DoGenerateText();
        });
        self.Entity().Instructions().WoundVACDressing.subscribe(function (newValue) {
            self.DoGenerateText();
        });
        self.Entity().Instructions().WoundVACDressingSetting.subscribe(function (newValue) {
            self.DoGenerateText();
        });
        self.Entity().Instructions().WoundVACDressingChanger.subscribe(function (newValue) {
            self.DoGenerateText();
        });
        self.Entity().Instructions().WoundVACDressingFrequency.subscribe(function (newValue) {
            self.DoGenerateText();
        });
        self.Entity().Instructions().WoundVACDressingTeachingMaterials.subscribe(function (newValue) {
            self.DoGenerateText();
        });

        self.Entity().HomecareSpecificIssues().Address.subscribe(function (newValue) {
            self.DoGenerateText();
        });
        self.Entity().HomecareSpecificIssues().Homebound.subscribe(function (newValue) {
            self.DoGenerateText();
        });
        self.Entity().HomecareSpecificIssues().F2F.subscribe(function (newValue) {
            self.DoGenerateText();
        });
        self.Entity().HomecareSpecificIssues().SpecificConditionsRequiringIntervention.subscribe(function (newValue) {
            self.DoGenerateText();
        });
        self.Entity().HomecareSpecificIssues().StartOfCare.subscribe(function (newValue) {
            self.DoGenerateText();
        });
        self.Entity().HomecareSpecificIssues().VerbalOrdersIssued.subscribe(function (newValue) {
            self.DoGenerateText();
        });

        self.Entity().VersionNumber.subscribe(function (newValue) {
            self.DoGenerateText();
        });
        self.Entity().BasedOnVersionNumber.subscribe(function (newValue) {
            self.DoGenerateText();
        });
        self.Entity().BasedOnSections.subscribe(function (newValue) {
            self.DoGenerateText();
        });
        self.Entity().SignificantChanges.subscribe(function (newValue) {
            self.DoGenerateText();
        });
        self.Entity().ForSpecificTeamMembers.subscribe(function (newValue) {
            self.DoGenerateText();
        });
        self.Entity().ReconciledBy().FirstName.subscribe(function (newValue) {
            self.DoGenerateText();
        });
        self.Entity().ReconciledBy().LastName.subscribe(function (newValue) {
            self.DoGenerateText();
        });
        self.Entity().DateReconciled.subscribe(function (newValue) {
            self.DoGenerateText();
        });
        self.Entity().NurseReview.subscribe(function (newValue) {
            self.DoGenerateText();
        });
        self.Entity().PhysicianReview.subscribe(function (newValue) {
            self.DoGenerateText();
        });

        $('.addable-table').on('click', 'tbody tr td .btn-group .dropdown-menu li a', function (e) {
            //swaps two rows and re-sorts priority
            var context = ko.contextFor(this);

            var index = context.$index(),
                directionUp = $(this).attr('class') == 'move-up',
                list;
            switch ($(this).parents('tbody').attr('id')) {
                case "shortTermGoalsSortable":
                    list = self.Entity().ShortTermGoals;
                    break;
                case "longTermGoalsSortable":
                    list = self.Entity().LongTermGoals;
                    break;
                case "problemSpecificGoalsSortable":
                    list = self.Entity().ProblemSpecificGoals;
                    break;
                case "weightSpecificGoalsSortable":
                    list = self.Entity().GoalWeight;
                    break;
            }

            if (directionUp) {
                self.SwapElements(list(), index, index - 1);
            }
            else {
                self.SwapElements(list(), index, index + 1);
            }

            self.UpdatePriorities(list());
            list.valueHasMutated();
            return e.preventDefault();
        });
    };

    self.RemoveItem = function(observableArray, item){
        bootbox.confirm("Are you sure you want to remove this entry? All data will be removed.", function(okPressed){
            if (okPressed){
                var list = observableArray();

                var index = _.indexOf(list, item);

                list.splice(index, 1);
                self.UpdatePriorities(list);
                observableArray.valueHasMutated();
            }
        });
    };

    self.SwapElements = function (list, index1, index2) {
        var tmp = list[index1];
        list[index1] = list[index2];
        list[index2] = tmp;
    };

    self.UpdatePriorities = function (list) {
        _.forEach(list, function (item, i) {
            if (item.Priority) {
                item.Priority(i + 1);
            }
        });
    };

    self.SaveEntity = function (document) {
        self.DoGenerateText();

        self.Entity().Author(SEE.util.convertUserToAuthor(SEE.session.User));

        //call base class
        SEE.viewmodel.document.section.BaseDocumentSection.prototype.SaveEntity.call(self, document);
    };

    self.DoAddNewShortTermGoal = function () {
        self.NewShortTermGoal().Priority(self.Entity().ShortTermGoals().length + 1);
        self.Entity().ShortTermGoals().push(self.NewShortTermGoal());
        self.Entity().ShortTermGoals.valueHasMutated();
        self.NewShortTermGoal(new SEE.model.dto.Goal());
        // $("#NewShortTermGoalDateInput").datepicker({ showButtonPanel: true, changeMonth: true, changeYear: true, yearRange: DATE_RANGE });
        self.DoGenerateText();
    };
    self.DoAddNewLongTermGoal = function () {
        self.NewLongTermGoal().Priority(self.Entity().LongTermGoals().length + 1);
        self.Entity().LongTermGoals().push(self.NewLongTermGoal());
        self.Entity().LongTermGoals.valueHasMutated();
        self.NewLongTermGoal(new SEE.model.dto.Goal());
        // $("#NewLongTermGoalDateInput").datepicker({ showButtonPanel: true, changeMonth: true, changeYear: true, yearRange: DATE_RANGE });
        self.DoGenerateText();
    };
    self.DoAddNewProblemSpecificGoal = function () {
        self.Entity().ProblemSpecificGoals().push(self.NewProblemSpecificGoal());
        self.Entity().ProblemSpecificGoals.valueHasMutated();
        self.NewProblemSpecificGoal(new SEE.model.dto.ProblemSpecificGoal());
        //  $("#NewProblemSpecificGoalDateInput").datepicker({ showButtonPanel: true, changeMonth: true, changeYear: true, yearRange: DATE_RANGE });
        self.DoGenerateText();
    };
    self.DoAddNewWeightGoal = function () {
        self.Entity().GoalWeight().push(self.NewWeightGoal());
        self.Entity().GoalWeight.valueHasMutated();
        self.NewWeightGoal(new SEE.model.dto.Goal());
        // $("#NewWeightGoalDateInput").datepicker({ showButtonPanel: true, changeMonth: true, changeYear: true, yearRange: DATE_RANGE });
        self.DoGenerateText();
    };
};

SEE.viewmodel.document.section.PlanOfCareSectionViewModel.inheritsFrom(SEE.viewmodel.document.section.BaseDocumentSection);