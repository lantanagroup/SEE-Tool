/// <reference path="../../../lib/external/crossroads/crossroads.js" />
/// <reference path="../../../session.js" />
SEE.namespace("SEE.viewmodel.document.section");

SEE.viewmodel.document.section.VitalsSectionViewModel = function () {
    SEE.viewmodel.document.section.BaseDocumentSection.prototype.init.call(this);

    var self = this;

    self.Title("VITAL SIGNS");
    self.UI.EditTemplateName("document/section/VitalsSection.html");

    self.Entity = ko.observable(new SEE.model.dto.VitalsSection());
    self.SelectedVital = ko.observable();
    self.SelectedVitalIsNew = ko.observable(true);
    self.ParentViewModel = {};

    var sortEntries = function () {
        self.Entity().Vitals.sort(function (a, b) {
            var aDate = Date.parse(a.DateRecorded());
            var bDate = Date.parse(b.DateRecorded());

            return aDate < bDate;
        });
    };

    self.LoadEntity = function (document) {
        //call base object
        SEE.viewmodel.document.section.BaseDocumentSection.prototype.LoadEntity.call(self, document);


    };

    self.OnAfterRender = function () {
        sortEntries();

        $(".author-info").tooltip( { html: true });
        $("i").tooltip( { html: true });
        $("img").tooltip( { html: true });


    };

    var generateCell = function(val, comment) {
        var output = val;

        if (comment != '') {
            output += " (" + comment + ")";
        }

        return output;
    };

    self.DoGenerateText = function () {
        sortEntries();

        var headers = ["Time", "Height", "Weight", "BMI", "BP", "Heart Rate", "Heart Rhythm", "Resp Rate", "O2 Sat", "Temp"];
        var rows = [];

        _.each(self.Entity().Vitals(), function (vital) {
            var newRow = [];

            newRow.push(generateCell(SEE.util.GetFormattedDateTime(vital.DateRecorded()), vital.DateRecordedComment()));

            if (vital.Height() != null && vital.Height() != '') {
                newRow.push(generateCell(vital.Height() + ' ' + vital.HeightUnit(), vital.HeightComment()));
            } else {
                newRow.push("");
            }

            if (vital.Weight() != null && vital.Weight() != '') {
                newRow.push(generateCell(vital.Weight() + ' ' + vital.WeightUnit(), vital.WeightComment()));
            } else {
                newRow.push("");
            }

            newRow.push(generateCell(vital.BMI(), vital.BMIComment()));

            if ((vital.SystolicBP() != null && vital.SystolicBP() != '') || (vital.DiastolicBP() != null && vital.DiastolicBP() != '')) {
                var part1 = generateCell(vital.SystolicBP() != null && vital.SystolicBP() != '' ? vital.SystolicBP() : '', vital.SystolicBPComment());
                var part2 = generateCell(vital.DiastolicBP() != null && vital.DiastolicBP() != '' ? vital.DiastolicBP() : '', vital.DiastolicBPComment());
                newRow.push(part1 + '/' + part2);
            } else {
                newRow.push("");
            }

            newRow.push(generateCell(vital.HeartRate(), vital.HeartRateComment()));
            newRow.push(generateCell(vital.HeartRhythmName(), vital.HeartRhythmComment()));
            newRow.push(generateCell(vital.RespiratoryRate(), vital.RespiratoryRateComment()));
            newRow.push(generateCell(vital.O2Sat(), vital.O2SatComment()));

            if (vital.Temperature() != null && vital.Temperature() != '') {
                newRow.push(generateCell(vital.Temperature() + ' ' + vital.TemperatureUnit(), vital.TemperatureComment()));
            } else {
                newRow.push("");
            }

            rows.push(newRow);
        });

        var html = "<br/>";
        if (rows.length > 0) {
            html = SEE.util.xml.CreateHtmlTable(headers, "", rows);
        }
        self.Entity().GeneratedNarrative(html);
    };

    self.CloneVital = function (p) {
        var mapping = { };

        var js = ko.mapping.toJS(p);
        var t = new SEE.model.dto.VitalSignEntry();
        ko.mapping.fromJS(js, mapping, t);
        return t;
    };


    self.DisplayVitalModal = function () {
        $("#VitalModal").modal('show');
    };

    self.DoAddVital = function () {
        self.SelectedVital(new SEE.model.dto.VitalSignEntry());
        self.SelectedVitalIsNew(true);
        self.SelectedVital().DateRecorded(new Date());

        self.DisplayVitalModal();
    };

    self.DoSaveVital = function () {
        
        $('#VitalModal').modal('hide');

        self.SelectedVital().Author(SEE.util.convertUserToAuthor(SEE.session.User));

        // Set the code depending on the item selected in the drop-down
        switch (self.SelectedVital().HeartRhythmName()) {
            case "regular sinus rhythm":
                self.SelectedVital().HeartRhythmValue("64730000");
                break;
            case "regularly irregular":
                self.SelectedVital().HeartRhythmValue("248652003");
                break;
            case "irregularly irregular":
                self.SelectedVital().HeartRhythmValue("248651005");
                break;
        }

        if (self.SelectedVitalIsNew()) {
            self.Entity().Vitals.push(self.SelectedVital());
        }
        else {
            var match = ko.utils.arrayFirst(self.Entity().Vitals(), function (item) {
                return self.SelectedVital().id() == item.id();
            });
            var i = self.Entity().Vitals().indexOf(match);

            if (i > -1) {
                self.Entity().Vitals.replace(self.Entity().Vitals()[i], self.SelectedVital());
            }
        }

        sortEntries();

        self.DoGenerateText();

        // Need to update the tooltips for authoring information
        $(".author-info").tooltip( { html: true });
        $("i").tooltip( { html: true });
    };

    self.DoRemoveVital = function () {
        bootbox.confirm("Are you sure you want to delete this Vital Sign entry? All data will be removed.", function(okPressed){
            if (okPressed){
                var data = ko.utils.arrayFirst(self.Entity().Vitals(), function (item) {
                    return self.SelectedVital().id() == item.id();
                });
                var index = _.indexOf(self.Entity().Vitals(), data);

                if (index >= 0) {
                    self.Entity().Vitals().splice(index, 1);
                    self.Entity().Vitals.valueHasMutated();
                }

                self.DoCancelVital();
                self.DoGenerateText();
            }
        });
    };

    self.DoEditVital = function (data) {
        self.SelectedVitalIsNew(false);
        var c = self.CloneVital(data);
        self.SelectedVital(c);
        self.DisplayVitalModal();
    };

    self.DoCancelVital = function () {
        if (!confirm("Any changes made to this dialog will be lost. Are you sure?")) {
            return;
        }

        $('#VitalModal').modal('hide');
        self.SelectedVital(null);
    };

    self.ImportSection = function (vitalSection) { //override base object
        var vitalEntries = vitalSection.Vitals; 
        //self.Entity().FreeNarrative(self.Entity().FreeNarrative() + vitalSection.FreeNarrative);
        _.each(vitalEntries, function (v) {
            var vitalEntry = new SEE.model.dto.VitalSignEntry();
            vitalEntry.fromJS.call(vitalEntry, v);
            vitalEntry.id(SEE.util.GUID());         // Make sure the new import of the vital gets an id
            self.Entity().Vitals.push(vitalEntry);
        });
        self.DoGenerateText();
    };

    self.DoImportVital = function () {
        var tabOpen = _.find(SEE.session.MainVM.Tabs(), function (tab) {
            return (tab.ViewModel.Name() === "DocumentViewModel" && tab.ViewModel !== self.ParentViewModel);
        });

        if (tabOpen) {
            SEE.service.DocumentService.TransformSection(tabOpen.ViewModel.Document, SEE.enum.SectionCode.VITAL, function (vitalsSection) {
                self.ImportSection(vitalsSection);
            });
        }
        else {
            bootbox.alert("You must have a second document open before importing.");
            //alert("You must have a second document open before importing.");
        }
    };

    self.OnClickPainAssessment = function() {
        self.ParentViewModel.NavigateToSection("FUNCTIONAL STATUS");
    };
};

SEE.viewmodel.document.section.VitalsSectionViewModel.inheritsFrom(SEE.viewmodel.document.section.BaseDocumentSection);