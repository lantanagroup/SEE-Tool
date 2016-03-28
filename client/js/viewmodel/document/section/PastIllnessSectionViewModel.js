/// <reference path="../../../lib/external/crossroads/crossroads.js" />
/// <reference path="../../../lib/internal/model/PastIllnessSection.js" />
SEE.namespace("SEE.viewmodel.document.section");

SEE.viewmodel.document.section.PastIllnessSectionViewModel = function () {
    SEE.viewmodel.document.section.BaseDocumentSection.prototype.init.call(this);

    var self = this;

    self.Title("HISTORY OF PAST ILLNESS");
    self.UI.EditTemplateName("document/section/PastIllnessSection.html");

    self.Entity = ko.observable(new SEE.model.dto.PastIllnessSection());
    self.SelectedPastIllness = ko.observable();
    self.SelectedPastIllnessIsNew = ko.observable(true);
    self.FilteredProblems = {};
    self.FilteredPertinentProblems = {};

    var sortEntries = function () {
        self.Entity().PastIllnesses.sort(function (a, b) {

            return a.DateOfOnset() < b.DateOfOnset();
        });
    };

    self.LoadEntity = function (document) {
        //call base object
        SEE.viewmodel.document.section.BaseDocumentSection.prototype.LoadEntity.call(self, document);

    };


    self.OnAfterRender = function () {
        sortEntries();

        $(".author-info").tooltip( { html: true });
    };

    self.DoGenerateText = function () {
        var list = $("<ul/>")
        //doc.append(list);

        // Entries
        _.each(self.Entity().PastIllnesses(), function (problem) {
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


            if (!SEE.util.IsPersonInfoEmpty(problem.Diagnoser()))
                sublist.append($("<li>Diagnosed By: " +  SEE.util.formatPersonInfo(problem.Diagnoser()) + "</li>"));

            //thePastIllnesses.push(cPastIllnessText);

            listItem.append(sublist);
            list.append(listItem);
        });

        var doc = $("<root/>");

        if (self.Entity().PastIllnesses().length > 0) {
            var pastIllnessTitle = $("<h4/>");
            pastIllnessTitle.text("History of Past Illness");

            doc.append(pastIllnessTitle);
            doc.append(list);
        }

        var html = doc.html();

        self.Entity().GeneratedNarrative(html);
    };

    self.ClonePastIllness = function (p) {
        var mapping = { };

        var js = ko.mapping.toJS(p);
        var t = new SEE.model.dto.PastIllnessEntry();
        ko.mapping.fromJS(js, mapping, t);
        return t;
    };

    self.DiagnoserChanged = function(){
        self.DoGenerateText();
    };

    self.InitializeTypeAhead = function () {
        var ds = SEE.service.DocumentService;
        $('#name').typeahead({
            source: function (query, process) {
                return ds.SnomedProblemSearch(query, function (results) {
                    var filteredNames = [];
                    _.each(results, function (item, index) {
                        self.FilteredProblems[item.SNOMED_FSN] = item;
                        filteredNames.push(item.SNOMED_FSN);
                    });
                    process(filteredNames);
                });
            },

            updater: function (item) {
                self.SelectedPastIllness.Name = item;
                return item;
            },
            minLength: 1,
            display: 'SNOMED_FSN',
            val: 'SNOMED_CID'
        });
    };

    self.DisplayPastIllnessModal = function () {
        self.InitializeTypeAhead();

        $("#ProblemModal").modal('show');
    };

    self.DoAddPastIllness = function () {
        self.SelectedPastIllness(new SEE.model.dto.PastIllnessEntry());

        self.SelectedPastIllness().DateOfOnset(null);
        self.SelectedPastIllness().ResolutionDate(null);
        self.SelectedPastIllnessIsNew(true);

        self.DisplayPastIllnessModal();
    };

    self.DoSavePastIllness = function () {

        $('#ProblemModal').modal('hide');

        self.SelectedPastIllness().Author(SEE.util.convertUserToAuthor(SEE.session.User));

        if (self.SelectedPastIllnessIsNew()) {
            self.Entity().PastIllnesses.push(self.SelectedPastIllness());
        }
        else {
            var match = ko.utils.arrayFirst(self.Entity().PastIllnesses(), function (item) {
                return self.SelectedPastIllness().id() == item.id();
            });
            var i = self.Entity().PastIllnesses().indexOf(match);

            if (i > -1) {
                self.Entity().PastIllnesses.replace(self.Entity().PastIllnesses()[i], self.SelectedPastIllness());
            }
        }

        sortEntries();

        self.DoGenerateText();

        // Need to update the tooltips for authoring information
        $(".author-info").tooltip( { html: true });
    };

    self.DoRemovePastIllness = function () {
        bootbox.confirm("Are you sure you want to delete this Past Illness entry? All data will be removed.", function(okPressed){
            if (okPressed){
                var data = ko.utils.arrayFirst(self.Entity().PastIllnesses(), function (item) {
                    return self.SelectedPastIllness().id() == item.id();
                });
                var index = _.indexOf(self.Entity().PastIllnesses(), data);

                if (index >= 0) {
                    self.Entity().PastIllnesses().splice(index, 1);
                    self.Entity().PastIllnesses.valueHasMutated();
                }

                self.DoCancelPastIllness();
                self.DoGenerateText();
            }
        });
    };

    self.DoEditPastIllness = function (data) {
        self.SelectedPastIllnessIsNew(false);
        self.SelectedPastIllness(self.ClonePastIllness(data));
        self.DisplayPastIllnessModal();
    };

    self.DoCancelPastIllness = function () {
        if (!confirm("Any changes made to this dialog will be lost. Are you sure?")) {
            return;
        }

        $('#ProblemModal').modal('hide');
        self.SelectedPastIllness(new SEE.model.dto.PastIllnessEntry());
    };

    self.DoImportPastIllness = function () {
        
    };
    self.NavigateToResults = function() {
        self.ParentViewModel.NavigateToSection("RESULTS");
    };

};

SEE.viewmodel.document.section.PastIllnessSectionViewModel.inheritsFrom(SEE.viewmodel.document.section.BaseDocumentSection);