SEE.namespace("SEE.viewmodel.document.section");

SEE.viewmodel.document.section.MedicationSectionViewModel = function () {
    SEE.viewmodel.document.section.BaseDocumentSection.prototype.init.call(this);

    var self = this;
    self.DocumentSectionPropertyName = "MedicationSection";
    self.Title("MEDICATIONS");
    self.UI.EditTemplateName("document/section/MedicationSection.html");

    self.Entity = ko.observable(new SEE.model.dto.MedicationSection());
    self.SelectedMedication = ko.observable(new SEE.model.dto.MedicationEntry());
    self.SelectedMedicationIsNew = ko.observable(true);
    self.SelectedMedicationExclusion = ko.observable(new SEE.model.dto.MedicationEntry());
    self.SelectedMedicationExclusionIsNew = ko.observable(true);
    self.FilteredIndications = {};
    self.MedicationsTypeAheadList = {};

    self.MedicationsSorter = new SEE.util.Sorter();
    self.ExcludedMedicationsSorter = new SEE.util.Sorter();

    self.Table = {};
    self.Table.Medications = 0;
    self.Table.MedicationExclusions = 1;

    self.TypeFlags = {};
    self.TypeFlags.CurrentActive = 1;
    self.TypeFlags.Preadmission = 2;
    self.TypeFlags.Admission = 4;
    self.TypeFlags.Discharge = 8;

    self.FilterTypeFlags = ko.observable(15);

    self.FilteredMedications = ko.computed(function(){
       return ko.utils.arrayFilter(self.Entity().Medications(), function(m){

           //you don't have any flags, so there's nothing to specifically exclude you
           if (!m.CurrentActive() && !m.Preadmission() && !m.Admission() && !m.Discharge()){
            return true;
           }

           var weWantIt = (self.FilterTypeFlags() & self.TypeFlags.CurrentActive);

           if (weWantIt && m.CurrentActive()){
               return true;
           }

           //else, you're not excluded yet, so keep checking
           weWantIt = (self.FilterTypeFlags() & self.TypeFlags.Preadmission);

           if (weWantIt && m.Preadmission()){
               return true;
           }

           //else, you're not excluded yet, so keep checking
           weWantIt = (self.FilterTypeFlags() & self.TypeFlags.Admission);

           if (weWantIt && m.Admission()){
               return true;
           }

           //else, you're not excluded yet, so keep checking
           weWantIt = (self.FilterTypeFlags() & self.TypeFlags.Discharge);

           if (weWantIt && m.Discharge()){
               return true;
           }

           //if you made it here, we don't want you
           return false;
       });
    });

    self.CurrentActiveFlagSelected = ko.computed({
       read: function(){
           return (self.FilterTypeFlags() & self.TypeFlags.CurrentActive);
       },
       write: function(value){
           self.FilterTypeFlags(self.FilterTypeFlags() ^ self.TypeFlags.CurrentActive);
       }, owner: self, deferEvaluation: true
    });

    self.PreadmissionFlagSelected = ko.computed({
        read: function(){
            return (self.FilterTypeFlags() & self.TypeFlags.Preadmission);
        },
        write: function(value){
            self.FilterTypeFlags(self.FilterTypeFlags() ^ self.TypeFlags.Preadmission);
        }, owner: self, deferEvaluation: true
    });

    self.AdmissionFlagSelected = ko.computed({
        read: function(){
            return (self.FilterTypeFlags() & self.TypeFlags.Admission);
        },
        write: function(value){
            self.FilterTypeFlags(self.FilterTypeFlags() ^ self.TypeFlags.Admission);
        }, owner: self, deferEvaluation: true
    });

    self.DischargeFlagSelected = ko.computed({
        read: function(){
            return (self.FilterTypeFlags() & self.TypeFlags.Discharge);
        },
        write: function(value){
            self.FilterTypeFlags(self.FilterTypeFlags() ^ self.TypeFlags.Discharge);
        }, owner: self, deferEvaluation: true
    });

    self.availableRoutes = ko.observableArray([]);

    self.LoadEntity = function (document) {
        //call base object
        SEE.viewmodel.document.section.BaseDocumentSection.prototype.LoadEntity.call(self, document);
    };

    self.OnAfterRender = function () {
        var ds = SEE.service.DocumentService;
        self.availableRoutes = ds.MedicationRouteSearch({}, function (results) {
            self.availableRoutes = _.sortBy(results.results, "Name");
        });

        self.MedicationsSorter.sort(self.Entity().Medications, 'DrugName', self.MedicationsSorter.textSorter);
        self.ExcludedMedicationsSorter.sort(self.Entity().MedicationExclusions, 'DrugName', self.ExcludedMedicationsSorter.textSorter);

        //activate the bootstrap filter switches
        $('.switch')['bootstrapSwitch']();
    };

    self.PrescriberChanged = function(){
      self.DoGenerateText();
    };

    self.DoGenerateText = function () {

        var doc = $("<root/>");

        if (self.Entity().Medications().length > 0) {
            var title = $("<h4/>");
            title.text("Medications");

            doc.append(title);

            var list = $("<ul/>")

            _.each(self.Entity().Medications(), function (s) {
                var listItem = $("<li/>");
                listItem.text(s.DrugName());

                var sublistItem = $("<ul/>");

                if (s.IndicationName())
                    sublistItem.append($("<li>Indication: " + s.IndicationName() + "</li>"));

                if (s.Dose())
                    sublistItem.append($("<li>Dosage Taken: " + s.Dose() + "</li>"));

                if (s.Frequency())
                    sublistItem.append($("<li>Frequency: " + s.Frequency() + "</li>"));

                if (s.StartDate())
                    sublistItem.append($("<li>Start Date: " + SEE.util.GetFormattedDate(s.StartDate()) + "</li>"));

                if (s.EndDate())
                    sublistItem.append($("<li>End Date: " + SEE.util.GetFormattedDate(s.EndDate()) + "</li>"));

                if (s.WarfarinTargetINR())
                    sublistItem.append($("<li>Target INR: " + s.WarfarinTargetINR() + "</li>"));

                if (s.WarfarinHasClinicianAgreedToManage())
                    sublistItem.append($("<li>Clinician has agreed to manage the warfarin</li>"));

                if (s.WarfarinLast3Doses())
                    sublistItem.append($("<li>Last 3 doses: " + s.WarfarinLast3Doses() + "</li>"));

                if (s.WarfarinRecommendedNextDose())
                    sublistItem.append($("<li>Recommended dose for next warfarin administration: " + s.WarfarinRecommendedNextDose() + "</li>"));

                if (s.WarfarinTimingNextDose())
                    sublistItem.append($("<li>Timing of next recommended warfarin dose: " + s.WarfarinTimingNextDose() + "</li>"));

                if (!s.WarfarinPrescriberForDoseChanges().IsEmpty())
                    sublistItem.append($("<li>Who will prescribe dose changes: " + s.WarfarinPrescriberForDoseChanges().FullName() + "</li>"));

                if (!s.Prescriber().IsEmpty())
                    sublistItem.append($("<li>Prescriber: " + s.Prescriber().FullName() + "</li>"));

                if (s.CurrentActive())
                    sublistItem.append($("<li>Current Active</li>"));
                if (s.Preadmission())
                    sublistItem.append($("<li>Preadmission</li>"));
                if (s.Admission())
                    sublistItem.append($("<li>Admission</li>"));
                if (s.Discharge())
                    sublistItem.append($("<li>Discharge</li>"));

                if (sublistItem.children().size() > 0)
                {
                    listItem.append(sublistItem);
                }

                list.append(listItem);

                doc.append(list);
            });

        }

        if (self.Entity().MedicationExclusions().length > 0) {
            var title = $("<h4/>");
            title.text("Excluded Medications");

            doc.append(title);

            var list = $("<ul/>")

            _.each(self.Entity().MedicationExclusions(), function (s) {
                var listItem = $("<li/>");
                listItem.text(s.DrugName());

                var sublistItem = $("<ul/>");

                if (s.IndicationName())
                    sublistItem.append($("<li>Indication: " + s.IndicationName() + "</li>"));

                if (s.Prescriber())
                    sublistItem.append($("<li>Prescriber: " + s.Prescriber().FullName() + "</li>"));

                if (sublistItem.children().size() > 0)
                {
                    listItem.append(sublistItem);
                }

                list.append(listItem);

                doc.append(list);
            });
        }

        var html = doc.html();

        self.Entity().GeneratedNarrative(html);
    };

    self.CloneMedicationEntry = function (p) {
        var mapping = {};

        var js = ko.mapping.toJS(p);
        var t = new SEE.model.dto.MedicationEntry();
        ko.mapping.fromJS(js, mapping, t);
        return t;
    };
    self.CloneMedicationExclusionEntry = function (p) {
        var mapping = {};

        var js = ko.mapping.toJS(p);
        var t = new SEE.model.dto.MedicationExclusionEntry();
        ko.mapping.fromJS(js, mapping, t);
        return t;
    };

    self.DisplayMedicationModal = function () {

        self.InitializeDrugNameTypeAhead();
        self.InitializeIndicationTypeAhead();
        $("#MedicationModal").modal('show');
    };
    self.DisplayMedicationExclusionModal = function () {

         self.InitializeDrugNameTypeAhead();
        self.InitializeIndicationTypeAhead();
        $("#MedicationExclusionModal").modal('show');
    };

    self.DoAddMedication = function () {
        self.SelectedMedication(new SEE.model.dto.MedicationEntry());
        self.SelectedMedication().StartDate(null);
        self.SelectedMedication().EndDate(null);
        self.SelectedMedicationIsNew(true);

        self.DisplayMedicationModal();
    };
    self.DoAddMedicationExclusion = function () {
        self.SelectedMedicationExclusion(new SEE.model.dto.MedicationExclusionEntry());
        self.SelectedMedicationExclusionIsNew(true);

        self.DisplayMedicationExclusionModal();
    };

    self.DoSaveMedication = function () {
        $('#MedicationModal').modal('hide');

        self.SelectedMedication().Author(SEE.util.convertUserToAuthor(SEE.session.User));

        if (self.SelectedMedicationIsNew()) {
            self.Entity().Medications.push(self.SelectedMedication());
        }
        else {
            var match = ko.utils.arrayFirst(self.Entity().Medications(), function (item) {
                return self.SelectedMedication().id() == item.id();
            });
            var i = self.Entity().Medications.indexOf(match);

            if (i > -1) {
                self.Entity().Medications.replace(self.Entity().Medications()[i], self.SelectedMedication());
            }
        }

        self.DoGenerateText();
        doSort();
    };
    self.DoSaveMedicationExclusion = function () {
        $('#MedicationExclusionModal').modal('hide');

        self.SelectedMedicationExclusion().Author(SEE.util.convertUserToAuthor(SEE.session.User));

        if (self.SelectedMedicationExclusionIsNew()) {
            self.Entity().MedicationExclusions.push(self.SelectedMedicationExclusion());
        }
        else {
            var match = ko.utils.arrayFirst(self.Entity().MedicationExclusions(), function (item) {
                return self.SelectedMedicationExclusion().id() == item.id();
            });
            var i = self.Entity().MedicationExclusions.indexOf(match);

            if (i > -1) {
                self.Entity().MedicationExclusions.replace(self.Entity().MedicationExclusions()[i], self.SelectedMedicationExclusion());
            }
        }

        self.DoGenerateText();
        doSortEx();
    };

    self.DoRemoveMedication = function (data) {
        bootbox.confirm("Are you sure you want to delete this Medication entry? All data will be removed.", function(okPressed){
            if (okPressed){
                var index = -1;
                _.forEach(self.Entity().Medications(), function (item, i) {
                    if (item.id() == self.SelectedMedication().id()) { index = i; };
                });
                if (index >= 0) {
                    self.Entity().Medications.splice(index, 1);
                    self.Entity().Medications.valueHasMutated();
                    self.DoCancelMedication();
                    self.DoGenerateText();
                }
            }
        });
    };

    self.DoRemoveMedicationExclusion = function () {
        bootbox.confirm("Are you sure you want to delete this entry? All data will be removed.", function(okPressed){
            if (okPressed){
                var index = -1;
                _.forEach(self.Entity().MedicationExclusions(), function (item, i) {
                    if (item.id() == self.SelectedMedicationExclusion().id()) { index = i; };
                });
                if (index >= 0) {
                    self.Entity().MedicationExclusions.splice(index, 1);
                    self.Entity().MedicationExclusions.valueHasMutated();
                    self.DoCancelMedicationExclusion();
                    self.DoGenerateText();
                }
            }
        });
    };

    self.DoEditMedication = function (data) {
        self.SelectedMedicationIsNew(false);
        self.SelectedMedication(self.CloneMedicationEntry(data));
        self.DisplayMedicationModal();
    };
    self.DoEditMedicationExclusion = function (data) {
        self.SelectedMedicationExclusionIsNew(false);
        self.SelectedMedicationExclusion(self.CloneMedicationExclusionEntry(data));
        self.DisplayMedicationExclusionModal();
    };

    self.DoCancelMedication = function () {
        if (!confirm("Any changes made to this dialog will be lost. Are you sure?")) {
            return;
        }

        $('#MedicationModal').modal('hide');
        self.SelectedMedication(new SEE.model.dto.MedicationEntry());
    };
    self.DoCancelMedicationExclusion = function () {
        if (!confirm("Any changes made to this dialog will be lost. Are you sure?")) {
            return;
        }

        $('#MedicationExclusionModal').modal('hide');
        self.SelectedMedicationExclusion(new SEE.model.dto.MedicationExclusionEntry());
    };

    self.InitializeIndicationTypeAhead = function () {
        var ds = SEE.service.DocumentService;
        $('.indication').typeahead({
            source: function (query, process) {
                return ds.SnomedProblemSearch(query, function (results) {
                    var filteredNames = [];
                    self.FilteredIndications = {};
                    _.each(results, function (item, index) {
                        self.FilteredIndications[item.SNOMED_FSN] = item;
                        filteredNames.push(item.SNOMED_FSN);
                    });
                    process(filteredNames);
                });
            },

            updater: function (item) {
                self.FilteredIndications.Name = item;
                self.FilteredIndications.Code = self.FilteredIndications[item.SNOMED_FSN];
                return item;
            },
            minLength: 1,
            display: 'SNOMED_FSN',
            val: 'SNOMED_CID'
        });
    }

    self.InitializeDrugNameTypeAhead = function () {
        var ds = SEE.service.DocumentService;
        $('.drugNameInput').typeahead({
            source: function (query, process) {
                return ds.MedicationSearch(query, function (results) {
                    var filteredNames = [];
                    self.MedicationsTypeAheadList = {};
                    _.each(results, function (item, index) {
                        self.MedicationsTypeAheadList[item.Name] = item;
                        filteredNames.push(item.Name);
                    });
                    process(filteredNames);
                });
            },

            updater: function (item) {
                self.MedicationsTypeAheadList.Name = item;
                self.MedicationsTypeAheadList.Code = self.MedicationsTypeAheadList[item.Cuid];
                self.AutoSelectRoute(item);

                return item;
            },
            minLength: 2,
            display: 'Name',
            val: 'Cuid'
        });
    };

    self.AutoSelectRoute = function (drugName) {
        //try to detect the route from words in the drug name such as: Oral, Tablet, etc        
        var code = "";
        var s = drugName.toLowerCase();
        if (s.indexOf("tablet") > -1) { code = "C38288"; }
        else if (s.indexOf("oral") > -1) { code = "C38288"; }
        else if (s.indexOf("nasal") > -1) { code = "C38284"; }
        else if (s.indexOf("intravenous") > -1) { code = "C38276"; }
        else if (s.indexOf("topical") > -1) { code = "C38304"; }
        else if (s.indexOf("rectal") > -1) { code = "C38295"; }
        
        if (code.length > 0) {
            self.SelectedMedication().RouteCode(code);
        }
    };

};

SEE.viewmodel.document.section.MedicationSectionViewModel.inheritsFrom(SEE.viewmodel.document.section.BaseDocumentSection);