/// <reference path="../../../lib/external/crossroads/crossroads.js" />
/// <reference path="../../../lib/external/crossroads/crossroads.js" />
/// <reference path="../../../lib/internal/utils/xml.js" />
/// <reference path="../../../lib/internal/model/ProblemSectionProblem.js" />
SEE.namespace("SEE.viewmodel.document.section");

SEE.viewmodel.document.section.FunctionalStatusViewModel = function () {
    SEE.viewmodel.document.section.BaseDocumentSection.prototype.init.call(this);

    var self = this;

    self.DocumentSectionPropertyName = "FunctionalStatusSection";
    self.Title("FUNCTIONAL STATUS");
    self.UI.EditTemplateName("document/section/FunctionalStatus.html");

    self.Entity = ko.observable(new SEE.model.dto.FunctionalStatusSection());
    //self.SelectedCapability = ko.observable();
    //self.SelectedCapabilityIsNew = ko.observable(true);
    //self.SelectedCognition = ko.observable();
    //self.SelectedCognitionIsNew = ko.observable(true);
    //self.SelectedDailyLiving = ko.observable();
    //self.SelectedDailyLivingIsNew = ko.observable(true);
    self.NewPainScale = ko.observable(new SEE.model.dto.FunctionalStatusPainScaleEntry());

    self.DefaultSpecialAlertsModalTime = ko.observable();
    self.DefaultActivitiesForDailyLivingModalTime = ko.observable();
    self.DefaultCognitionModalTime = ko.observable();
    self.DefaultCapabilityModalTime = ko.observable();

    var initializeControls = function() {
        $(".author-info").tooltip( { html: true });

        var DATE_RANGE = "c-100:+10";

        $(".datePicker").datepicker({ showButtonPanel: true, changeMonth: true, changeYear: true, yearRange: DATE_RANGE });
        $(".modalDatePicker").datepicker({ showButtonPanel: true, changeMonth: true, changeYear: true, yearRange: DATE_RANGE, maxDate: '0' });

    };

    var addFunctionalStatusEntry = function(list, name, value, effectiveTime, defaultEffectiveTime) {
        if (value == '' || value == null) {
            return;
        }

        var newEntry = new SEE.model.dto.FunctionalStatusEntry();
        newEntry.Author(SEE.util.convertUserToAuthor(SEE.session.User));
        newEntry.Name(name);
        newEntry.Value(value);

        if (effectiveTime != '' && effectiveTime != null) {
            var dt = new Date(effectiveTime);
            newEntry.EffectiveTime(dt);
        } else {
            newEntry.EffectiveTime(defaultEffectiveTime);
        }

        list.push(newEntry);
    };

    self.LoadEntity = function(document) {
        //call base class
        SEE.viewmodel.document.section.BaseDocumentSection.prototype.LoadEntity.call(self, document);


    };

    self.OnAfterRender = function () {
        self.Entity().GAFScore.subscribe(function() {
            self.DoGenerateText();
        });

        initializeControls();
    };

    self.DoGenerateText = function () {
        var html = '';

        // Daily Livings
        if (self.Entity().DailyLivings().length > 0) {
            var items = [];

            _.each(self.Entity().DailyLivings(), function(entry) {
                items.push(entry.Name() + ": " + entry.Value() + " (" + SEE.util.GetFormattedDate(entry.EffectiveTime()) + ")");
            });

            html += SEE.util.xml.CreateHtmlList(items, "Activities for Daily Living");
        }

        // Capabilities
        if (self.Entity().Capabilities().length > 0) {
            var items = [];

            _.each(self.Entity().Capabilities(), function(entry) {
                items.push(entry.Name() + ": " + entry.Value() + " (" + SEE.util.GetFormattedDate(entry.EffectiveTime()) + ")");
            });

            html += SEE.util.xml.CreateHtmlList(items, "Capabilities");
        }

        // Cognitions
        if (self.Entity().Cognitions().length > 0) {
            var items = [];

            _.each(self.Entity().Cognitions(), function(entry) {
                items.push(entry.Name() + ": " + entry.Value() + " (" + SEE.util.GetFormattedDate(entry.EffectiveTime()) + ")");
            });

            html += SEE.util.xml.CreateHtmlList(items, "Cognition/Mental Status");
        }

        // SpecialAlerts
        if (self.Entity().SpecialAlerts().length > 0) {
            var items = [];

            _.each(self.Entity().SpecialAlerts(), function(entry) {
                items.push(entry.Name() + ": " + entry.Value() + " (" + SEE.util.GetFormattedDate(entry.EffectiveTime()) + ")");
            });

            html += SEE.util.xml.CreateHtmlList(items, "Special Alerts");
        }

        // Pain Scales
        if (self.Entity().PainScales().length > 0) {
            //var painScaleHeaders = ["Score", "Effective Time"];
            var painScaleRows = [];

            _.each(self.Entity().PainScales(), function (s) {
               // var columns = [s.PainScore(), s.PainScoreEffectiveTime()];
                var text = s.PainScore();

                if (s.PainScoreEffectiveTime())
                    text += " (on " + SEE.util.GetFormattedDate(s.PainScoreEffectiveTime()) + ")";

                painScaleRows.push(text);
            });

            html += SEE.util.xml.CreateHtmlList(painScaleRows, "Pain Scale");
        }

        // GAF Score
        if (self.Entity().GAFScore() != null && self.Entity().GAFScore() != '') {
            html += $('<span><br/>GAF Score: ' + self.Entity().GAFScore() + '</span>').html();
        }

        self.Entity().GeneratedNarrative(html);
    };

    /////////////////////////
    // Capabilities
    /////////////////////////
    self.DoAddCapability = function () {
        $("#FunctionalStatusCapabilityModal").modal('show');

        $(".modalValue").val("");

        self.DefaultCapabilityModalTime(new Date());
    };

    self.DoSaveCapability = function () {

        $('#FunctionalStatusCapabilityModal').modal('hide');

        var defaultEffectiveTime = self.DefaultCapabilityModalTime();

        addFunctionalStatusEntry(self.Entity().Capabilities, "Cognition", $("#cognitiveStatusCognition").val(), $("#cognitiveStatusCognitionEffectiveTimePicker").val(), defaultEffectiveTime);
        addFunctionalStatusEntry(self.Entity().Capabilities, "Serious Difficulty Concentrating, Remembering, or Making Decisions", $("#cognitiveStatusDifficultyMakingDecision").val(), $("#cognitiveStatusDifficultyMakingDecisionEffectiveTimePicker").val(), defaultEffectiveTime);
        addFunctionalStatusEntry(self.Entity().Capabilities, "Speech", $("#speech").val(), $("#speechEffectiveTimePicker").val(), defaultEffectiveTime);
        addFunctionalStatusEntry(self.Entity().Capabilities, "Hearing", $("#hearing").val(), $("#hearingEffectiveTimePicker").val(), defaultEffectiveTime);
        addFunctionalStatusEntry(self.Entity().Capabilities, "Vision", $("#vision").val(), $("#visionEffectiveTimePicker").val(), defaultEffectiveTime);
        addFunctionalStatusEntry(self.Entity().Capabilities, "Sensation", $("#sensation").val(), $("#sensationEffectiveTimePicker").val(), defaultEffectiveTime);
        addFunctionalStatusEntry(self.Entity().Capabilities, "Mobility", $("#mobility").val(), $("#mobilityEffectiveTimePicker").val(), defaultEffectiveTime);
        addFunctionalStatusEntry(self.Entity().Capabilities, "Amputation", $("#amputation").val(), $("#amputationEffectiveTimePicker").val(), defaultEffectiveTime);
        addFunctionalStatusEntry(self.Entity().Capabilities, "Paralysis", $("#paralysis").val(), $("#paralysisEffectiveTimePicker").val(), defaultEffectiveTime);
        addFunctionalStatusEntry(self.Entity().Capabilities, "Contractures", $("#contractures").val(), $("#contracturesEffectiveTimePicker").val(), defaultEffectiveTime);
        addFunctionalStatusEntry(self.Entity().Capabilities, "Serious Difficulty Walking or Climbing Stairs", $("#difficultyWalking").val(), $("#difficultyWalkingEffectiveTimePicker").val(), defaultEffectiveTime);
        addFunctionalStatusEntry(self.Entity().Capabilities, "Other", $("#other").val(), $("#otherEffectiveTimePicker").val(), defaultEffectiveTime);
        addFunctionalStatusEntry(self.Entity().Capabilities, "Difficulty Bathing or Dressing", $("#difficultyBathing").val(), $("#difficultyBathingEffectiveTimePicker").val(), defaultEffectiveTime);
        addFunctionalStatusEntry(self.Entity().Capabilities, "Difficulty Doing Errands Alone", $("#difficultyErrands").val(), $("#difficultyErrandsEffectiveTimePicker").val(), defaultEffectiveTime);

        self.DoGenerateText();
        initializeControls();
    };

    self.DoCancelCapability = function () {
        if (!confirm("Any changes made to this dialog will be lost. Are you sure?")) {
            return;
        }

        $('#FunctionalStatusCapabilityModal').modal('hide');
    };

     /////////////////////////
    // Cognition
    /////////////////////////
    self.DoAddCognition = function () {
        $("#FunctionalStatusCognitionModal").modal('show');

        $(".modalValue").val("");

        self.DefaultCognitionModalTime(new Date());
    };

    self.DoSaveCognition = function () {

        $('#FunctionalStatusCognitionModal').modal('hide');

        var defaultEffectiveTime = self.DefaultCognitionModalTime();

        addFunctionalStatusEntry(self.Entity().Cognitions, "Status at Transfer", $("#statusAtTransfer").val(), $("#statusAtTransferEffectiveTimePicker").val(), defaultEffectiveTime);
        addFunctionalStatusEntry(self.Entity().Cognitions, "Ability to Consent to Treatment", $("#cognitiveAbilityToConsentToTreatment").val(), $("#cognitiveAbilityToConsentToTreatmentEffectiveTimePicker").val(), defaultEffectiveTime);
        addFunctionalStatusEntry(self.Entity().Cognitions, "Ability to Comprehend", $("#cognitiveAbilityToComprehend").val(), $("#cognitiveAbilityToComprehendEffectiveTimePicker").val(), defaultEffectiveTime);
        addFunctionalStatusEntry(self.Entity().Cognitions, "Ability to Express Wishes", $("#cognitiveAbilityToExpressWishes").val(), $("#cognitiveAbilityToExpressWishesEffectiveTimePicker").val(), defaultEffectiveTime);
        addFunctionalStatusEntry(self.Entity().Cognitions, "Memory", $("#cognitiveStatusMemory").val(), $("#cognitiveStatusMemoryEffectiveTimePicker").val(), defaultEffectiveTime);
        addFunctionalStatusEntry(self.Entity().Cognitions, "Judgement", $("#cognitiveStatusJudgement").val(), $("#cognitiveStatusJudgementEffectiveTimePicker").val(), defaultEffectiveTime);
        addFunctionalStatusEntry(self.Entity().Cognitions, "Orientation", $("#cognitiveStatusOrientation").val(), $("#cognitiveStatusOrientationEffectiveTimePicker").val(), defaultEffectiveTime);
        addFunctionalStatusEntry(self.Entity().Cognitions, "Concentration", $("#cognitiveStatusConcentration").val(), $("#cognitiveStatusConcentrationEffectiveTimePicker").val(), defaultEffectiveTime);
        addFunctionalStatusEntry(self.Entity().Cognitions, "Mood", $("#cognitiveStatusMood").val(), $("#cognitiveStatusMoodEffectiveTimePicker").val(), defaultEffectiveTime);

        self.DoGenerateText();
        initializeControls();
    };

    self.DoCancelCognition = function () {
        if (!confirm("Any changes made to this dialog will be lost. Are you sure?")) {
            return;
        }

        $('#FunctionalStatusCognitionModal').modal('hide');
    };

    /////////////////////////
    // Special Alerts
    /////////////////////////
    self.DoAddSpecialAlerts = function () {
        $("#SpecialAlertsModal").modal('show');

        $(".modalValue").val("");
        //reset the default time from last time
        self.DefaultSpecialAlertsModalTime(new Date());

    };

    self.DoSaveSpecialAlerts = function () {
        $('#SpecialAlertsModal').modal('hide');

        var defaultEffectiveTime = self.DefaultSpecialAlertsModalTime();

        addFunctionalStatusEntry(self.Entity().SpecialAlerts, "Supervised feeding", $("#specialAlertSupervisedFeeding").val(), $("#specialAlertSupervisedFeedingEffectiveTimePicker").val(), defaultEffectiveTime);
        addFunctionalStatusEntry(self.Entity().SpecialAlerts, "Oxygen", $("#specialAlertOxygen").val(), $("#specialAlertOxygenEffectiveTimePicker").val(), defaultEffectiveTime);
        addFunctionalStatusEntry(self.Entity().SpecialAlerts, "Needs assist with feeding", $("#specialAlertAssistFeeding").val(), $("#specialAlertAssistFeedingEffectiveTimePicker").val(), defaultEffectiveTime);
        addFunctionalStatusEntry(self.Entity().SpecialAlerts, "Tube feeding", $("#specialAlertTubeFeeding").val(), $("#specialAlertTubeFeedingEffectiveTimePicker").val(), defaultEffectiveTime);
        addFunctionalStatusEntry(self.Entity().SpecialAlerts, "Fall Risk", $("#specialAlertFallRisk").val(), $("#specialAlertFallRiskEffectiveTimePicker").val(), defaultEffectiveTime);
        addFunctionalStatusEntry(self.Entity().SpecialAlerts, "Aspiration Risk", $("#specialAlertAspirationRisk").val(), $("#specialAlertAspirationRiskEffectiveTimePicker").val(), defaultEffectiveTime);
        addFunctionalStatusEntry(self.Entity().SpecialAlerts, "Limited/non-weightbearing Left/Right, Upper/Lower", $("#specialAlertWeightBearing").val(), $("#specialAlertWeightBearingEffectiveTimePicker").val(), defaultEffectiveTime);
        addFunctionalStatusEntry(self.Entity().SpecialAlerts, "Violent Behavior", $("#specialAlertViolentBehavior").val(), $("#specialAlertViolentBehaviorEffectiveTimePicker").val(), defaultEffectiveTime);
        addFunctionalStatusEntry(self.Entity().SpecialAlerts, "Special accommodation for medication administration", $("#specialAlertMedicalAdmission").val(), $("#specialAlertMedicalAdmissionEffectiveTimePicker").val(), defaultEffectiveTime);
        addFunctionalStatusEntry(self.Entity().SpecialAlerts, "Trouble swallowing", $("#specialAlertTroubleSwallowing").val(), $("#specialAlertTroubleSwallowingEffectiveTimePicker").val(), defaultEffectiveTime);
        addFunctionalStatusEntry(self.Entity().SpecialAlerts, "Elopement", $("#specialAlertElopement").val(), $("#specialAlertElopementEffectiveTimePicker").val(), defaultEffectiveTime);
        addFunctionalStatusEntry(self.Entity().SpecialAlerts, "Wanderer", $("#specialAlertWanderer").val(), $("#specialAlertWandererEffectiveTimePicker").val(), defaultEffectiveTime);
        addFunctionalStatusEntry(self.Entity().SpecialAlerts, "Seizure", $("#specialAlertSeizure").val(), $("#specialAlertSeizureEffectiveTimePicker").val(), defaultEffectiveTime);
        addFunctionalStatusEntry(self.Entity().SpecialAlerts, "Other", $("#specialAlertOther").val(), $("#specialAlertOtherEffectiveTimePicker").val(), defaultEffectiveTime);

        self.DoGenerateText();
        initializeControls();
    };

    self.DoCancelSpecialAlerts = function () {
        if (!confirm("Any changes made to this dialog will be lost. Are you sure?")) {
            return;
        }

        $('#SpecialAlertsModal').modal('hide');
    };


    /////////////////////////
    // DailyLiving
    /////////////////////////
    self.DoAddDailyLiving = function () {
        $("#FunctionalStatusDailyLivingModal").modal('show');


        //wonder if these 2 functions could be done with intialize controls called when modals close and the app starts
        $(".modalValue").val("");

        self.DefaultActivitiesForDailyLivingModalTime(new Date());
    };

    self.DoSaveDailyLiving = function () {

        $('#FunctionalStatusDailyLivingModal').modal('hide');

        var defaultEffectiveTime = self.DefaultActivitiesForDailyLivingModalTime();

        addFunctionalStatusEntry(self.Entity().DailyLivings, "Bathing", $("#bathing").val(), $("#bathingEffectiveTimePicker").val(), defaultEffectiveTime);
        addFunctionalStatusEntry(self.Entity().DailyLivings, "Dressing", $("#dressing").val(), $("#dressingEffectiveTimePicker").val(), defaultEffectiveTime);
        addFunctionalStatusEntry(self.Entity().DailyLivings, "Toileting", $("#toileting").val(), $("#toiletingEffectiveTimePicker").val(), defaultEffectiveTime);
        addFunctionalStatusEntry(self.Entity().DailyLivings, "Transfers", $("#transfers").val(), $("#transfersEffectiveTimePicker").val(), defaultEffectiveTime);
        addFunctionalStatusEntry(self.Entity().DailyLivings, "Ambulation", $("#ambulation").val(), $("#ambulationEffectiveTimePicker").val(), defaultEffectiveTime);
        addFunctionalStatusEntry(self.Entity().DailyLivings, "Eating", $("#eating").val(), $("#eatingEffectiveTimePicker").val(), defaultEffectiveTime);
        addFunctionalStatusEntry(self.Entity().DailyLivings, "Ambulation Distance", $("#ambulationDistance").val(), $("#ambulationDistanceEffectiveTimePicker").val(), defaultEffectiveTime);
        addFunctionalStatusEntry(self.Entity().DailyLivings, "Continent of Bowel", $("#continentOfBowel").val(), $("#continentOfBowelEffectiveTimePicker").val(), defaultEffectiveTime);
        addFunctionalStatusEntry(self.Entity().DailyLivings, "Continent of Bladder", $("#continentOfBladder").val(), $("#continentOfBladderEffectiveTimePicker").val(), defaultEffectiveTime);
        addFunctionalStatusEntry(self.Entity().DailyLivings, "Last Bowel Movement", $("#lastBowelMovement").val(), $("#lastBowelMovementEffectiveTimePicker").val(), defaultEffectiveTime);
        addFunctionalStatusEntry(self.Entity().DailyLivings, "Clearance to Drive", $("#clearanceToDrive").val(), $("#clearanceToDriveEffectiveTimePicker").val(), defaultEffectiveTime);

        self.DoGenerateText();
        initializeControls();
    };

    self.DoCancelDailyLiving = function () {
        if (!confirm("Any changes made to this dialog will be lost. Are you sure?")) {
            return;
        }

        $('#FunctionalStatusDailyLivingModal').modal('hide');
    };

    self.SetToToday = function(field){
        var dt = new Date();
        field(new Date(dt.getFullYear(), dt.getMonth(), dt.getDate(), 0, 0, 0));
    };

    self.SetElementToday = function(element){
        var dt = new Date();
        var today = new Date(dt.getFullYear(), dt.getMonth(), dt.getDate(), 0, 0, 0);

        element.datepicker("setDate", today);
        //element.datepicker({ dateFormat: 'mm/dd/yy' })
    };

    /////////////////////////
    // Pain Scale
    /////////////////////////
    self.DoAddPainScale = function () {
        self.Entity().PainScales().push(self.NewPainScale());
        self.Entity().PainScales.valueHasMutated();

        self.NewPainScale(new SEE.model.dto.FunctionalStatusPainScaleEntry());

        self.DoGenerateText();

        initializeControls();
    };

    self.DoRemoveItem = function (item, koCollection){
        bootbox.confirm("Are you sure you want to delete this item?", function(okPressed){
            if (okPressed){
                var currentValueOfCollection =  ko.utils.unwrapObservable(koCollection);
                var index = _.indexOf(currentValueOfCollection, item);
                if (index >= 0) {
                    currentValueOfCollection.splice(index, 1);
                    koCollection.valueHasMutated();
                }

                self.DoGenerateText();
            }
        });
    }
};

SEE.viewmodel.document.section.FunctionalStatusViewModel.inheritsFrom(SEE.viewmodel.document.section.BaseDocumentSection);