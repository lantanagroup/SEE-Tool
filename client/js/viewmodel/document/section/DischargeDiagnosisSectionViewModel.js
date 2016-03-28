/// <reference path="../../../lib/external/crossroads/crossroads.js" />
/// <reference path="../../../lib/internal/model/ProblemSectionProblem.js" />
SEE.namespace("SEE.viewmodel.document.section");

SEE.viewmodel.document.section.DischargeDiagnosisSectionViewModel = function () {
    SEE.viewmodel.document.section.BaseDocumentSection.prototype.init.call(this);

    var self = this;

    self.DocumentSectionPropertyName = "DischargeDiagnosisSection";
    self.Title("DISCHARGE DIAGNOSIS");
    self.UI.EditTemplateName("document/section/DischargeDiagnosisSection.html");

    self.Entity = ko.observable(new SEE.model.dto.DischargeDiagnosisSection());
    self.SelectedDischargeDiagnosis = ko.observable();
    self.SelectedDischargeDiagnosisIsNew = ko.observable(true);
    self.FilteredDischargediagnosis = {};
    self.FilteredPertinentDischargeDiagnosis = {};
    self.TempDischargeDiagnosisFinding = new SEE.model.dto.ProblemFinding();

    self.LoadEntity = function (document) {
        //call base class
        SEE.viewmodel.document.section.BaseDocumentSection.prototype.LoadEntity.call(self, document);

    };

    self.OnAfterRender = function () {
        self.DoGenerateText();

        self.SortDischargeDiagnosis();

        $(".author-info").tooltip( { html: true });
    };

    self.SortDischargeDiagnosis = function()
    {
        self.Entity().DischargeDiagnosis.sort(function (left, right) {
            if (left.Name() === right.Name()) {
                if (left.DateOfOnset() === right.DateOfOnset()) {
                    return 0;
                }
                else {
                    return (left.DateOfOnset() < right.DateOfOnset() ? -1 : 1)
                }
            }
            else {
                return (left.Name() < right.Name() ? -1 : 1)
            }
        });

        self.Entity().DischargeDiagnosis.valueHasMutated();
    }

    self.DiagnoserChanged = function(){
      self.DoGenerateText();
    };

    self.DoGenerateText = function () {
        var list = $("<ul/>")
        //doc.append(list);

        // Entries
        _.each(self.Entity().DischargeDiagnosis(), function (problem) {
            //var cPastIllnessText = cPastIllness.Name();
            var listItem = $("<li/>");
            var sublist = $("<ul/>");

            listItem.text(problem.Name());

            if (problem.DateOfOnset())
                sublist.append($("<li>Onset Date: " +  SEE.util.GetFormattedDate(problem.DateOfOnset()) + "</li>"));

            if (problem.ResolutionDate())
                sublist.append($("<li>Resolution Date: " +  SEE.util.GetFormattedDate(problem.ResolutionDate()) + "</li>"));

            if (problem.WorstSeverity())
                sublist.append($("<li>Worst Severity: " +  SEE.util.GetSeverityName(problem.WorstSeverity()) + "</li>"));

            if (problem.CurrentSeverity())
                sublist.append($("<li>Current Severity: " +  SEE.util.GetSeverityName(problem.CurrentSeverity()) + "</li>"));


            if (!SEE.util.IsPersonInfoEmpty(problem.Diagnoser()))
                sublist.append($("<li>Diagnosed By: " +  SEE.util.formatPersonInfo(problem.Diagnoser()) + "</li>"));

            //thePastIllnesses.push(cPastIllnessText);

            listItem.append(sublist);
            list.append(listItem);
        });

        var doc = $("<root/>");

        if (self.Entity().DischargeDiagnosis().length > 0) {
            var pastIllnessTitle = $("<h4/>");
            pastIllnessTitle.text("Discharge Diagnoses");

            doc.append(pastIllnessTitle);
            doc.append(list);
        }

        var html = doc.html();

        self.Entity().GeneratedNarrative(html);
    };


    self.DisplayDischargeDiagnosisModal = function () {
        self.InitializeTypeAhead();

        $("#ProblemModal").modal('show');
    };

    self.DoAddDischargeDiagnosis = function () {
        self.SelectedDischargeDiagnosis(new SEE.model.dto.DischargeDiagnosisEntry());
        self.SelectedDischargeDiagnosis().DateOfOnset(null);
        self.SelectedDischargeDiagnosis().ResolutionDate(null);
        self.SelectedDischargeDiagnosisIsNew(true);        
        
        self.DisplayDischargeDiagnosisModal();
    };

    self.DoSaveDischargeDiagnosis = function () {
        $('#ProblemModal').modal('hide');

        self.SelectedDischargeDiagnosis().Author(SEE.util.convertUserToAuthor(SEE.session.User));
        
        if (self.SelectedDischargeDiagnosisIsNew()) {
            self.Entity().DischargeDiagnosis.push(self.SelectedDischargeDiagnosis());
        }
        else {
            var match = ko.utils.arrayFirst(self.Entity().DischargeDiagnosis(), function (item) {
                return self.SelectedDischargeDiagnosis().id() == item.id();
            });
            var i = self.Entity().DischargeDiagnosis.indexOf(match);

            if (i > -1) {
                self.Entity().DischargeDiagnosis.replace(self.Entity().DischargeDiagnosis()[i], self.SelectedDischargeDiagnosis());
            }
        }

        self.DoGenerateText();

        // Need to update the tooltips for authoring information
        $(".author-info").tooltip( { html: true });
    };

    self.DoCancelDischargeDiagnosis = function () {
        if (!confirm("Any changes made to this dialog will be lost. Are you sure?")) {
            return;
        }

        $('#ProblemModal').modal('hide');
        self.SelectedDischargeDiagnosis(new SEE.model.dto.DischargeDiagnosisEntry());
    };

    self.DoEditDischargeDiagnosis = function (data) {
        self.SelectedDischargeDiagnosisIsNew(false);
        self.SelectedDischargeDiagnosis(self.CloneDischargeDiagnosis(data));
        self.DisplayDischargeDiagnosisModal();
    };

    self.DoAddDischargeDiagnosisFinding = function () {
        if (self.TempDischargeDiagnosisFinding) {
            self.SelectedDischargeDiagnosis().DischargeDiagnosisFindings.push(self.TempDischargeDiagnosisFinding);
        }
    };

    self.DoDeleteDischargeDiagnosisFinding = function (p) {
        self.SelectedDischargeDiagnosis().DischargeDiagnosisFindings.remove(function (item) {
            return item.id == p.id
        });
    };

    self.CloneDischargeDiagnosis = function (p) {
        var mapping = {
            'ignore': ['IsActive', 'IsHighRisk', 'FullName']
        };

        //var js = ko.mapping.toJS(p);
        var t = new SEE.model.dto.DischargeDiagnosisEntry();
        t.fromJS(p.toJS());
        //ko.mapping.fromJS(js, mapping, t);
        return t;
    };
    
    self.DoRemoveDischargeDiagnosis = function () {
        bootbox.confirm("Are you sure you want to delete this Discharge Diagnosis entry? All data will be removed.", function(okPressed){
            if (okPressed){
                var data = ko.utils.arrayFirst(self.Entity().DischargeDiagnosis(), function (item) {
                    return self.SelectedDischargeDiagnosis().id() == item.id();
                });
                var index = _.indexOf(self.Entity().DischargeDiagnosis(), data);

                if (index >= 0) {
                    self.Entity().DischargeDiagnosis.splice(index, 1);
                    self.Entity().DischargeDiagnosis.valueHasMutated();
                }

                self.DoCancelDischargeDiagnosis();
                self.DoGenerateText();
            }
        });
    };

    self.InitializeTypeAhead = function () {
        var ds = SEE.service.DocumentService;
        $('#name').typeahead({
            source: function (query, process) {                                
                return ds.SnomedProblemSearch(query, function (results) {
                    var filteredNames = [];
                    _.each(results, function (item, index) {                        
                        self.FilteredPertinentDischargeDiagnosis[item.SNOMED_FSN] = item;
                        filteredNames.push(item.SNOMED_FSN);
                    });
                    process(filteredNames);
                });
            },
            updater: function (item) {
                self.SelectedDischargeDiagnosis.Name = item;
                self.SelectedDischargeDiagnosis.Code = self.FilteredPertinentDischargeDiagnosis[item.SNOMED_FSN];
                return item;
            },
            minLength: 1,
            display: 'SNOMED_FSN',
            val: 'SNOMED_CID'
        });
    };

    self.InitializePertinentTypeAhead = function () {
        var ds = SEE.service.DocumentService;
        $('#pertinentFindings').typeahead({
            source: function (query, process) {
                return ds.SnomedProblemSearch(query, function (results) {
                    var filteredPertinentNames = [];
                    _.each(results, function (item, index) {
                        self.FilteredPertinentDischargeDiagnosis[item.SNOMED_FSN] = item;
                        filteredPertinentNames.push(item.SNOMED_FSN);
                    });
                    process(filteredPertinentNames);
                });
            },
            matcher: function (item) {
                return true;
            },
            sorter: function (items) {
                return items.sort();
            },
            highlighter: function (item) {
                return item;
            },
            updater: function (item) {
                self.TempDischargeDiagnosisFinding = new SEE.model.dto.DischargeDiagnosisFinding();
                self.TempDischargeDiagnosisFinding.Name = item;
                self.TempDischargeDiagnosisFinding.Code = self.FilteredPertinentDischargeDiagnosis[item].SNOMED_CID;
                return item;
            },
            minLength: 1,
            display: 'SNOMED_FSN',
            val: 'SNOMED_CID'
        });
    };

    self.OnClickGAFScore = function() {
        self.ParentViewModel.DoSelectSection(self.ParentViewModel.Sections()[7]);
    };

    self.doShowPersonInfo = function () {
        self.DisplayEditDiagnoserInfo(true);
    };

    self.NavigateToResults = function() {
        self.ParentViewModel.NavigateToSection("RESULTS");
    };

    self.DisplayEditDiagnoserInfo = ko.observable(false);
};
SEE.viewmodel.document.section.DischargeDiagnosisSectionViewModel.inheritsFrom(SEE.viewmodel.document.section.BaseDocumentSection);