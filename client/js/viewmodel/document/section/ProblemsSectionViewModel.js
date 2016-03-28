/// <reference path="../../../lib/external/crossroads/crossroads.js" />
/// <reference path="../../../lib/internal/model/ProblemSectionProblem.js" />
SEE.namespace("SEE.viewmodel.document.section");

SEE.viewmodel.document.section.ProblemSectionViewModel = function () {
    SEE.viewmodel.document.section.BaseDocumentSection.prototype.init.call(this);

    var self = this;

    self.DocumentSectionPropertyName = "ProblemSection";
    self.Title("PROBLEMS");
    self.UI.EditTemplateName("document/section/ProblemSection.html");

    self.Entity = ko.observable(new SEE.model.dto.ProblemSection());
    self.SelectedProblem = ko.observable();
    self.SelectedProblemIsNew = ko.observable(true);
    self.FilteredProblems = {};
    self.FilteredPertinentProblems = {};
    self.TempProblemFinding = new SEE.model.dto.ProblemFinding();

    self.LoadEntity = function (data) {
        //call base object
        SEE.viewmodel.document.section.BaseDocumentSection.prototype.LoadEntity.call(self, data);
    };

    self.OnAfterRender = function () {
        var updateGeneratedText = function (newValue) {
            self.DoGenerateText();
        };

        self.Entity().DSM_AXIS_1.subscribe(updateGeneratedText);
        self.Entity().DSM_AXIS_2.subscribe(updateGeneratedText);
        self.Entity().DSM_AXIS_3.subscribe(updateGeneratedText);
        self.Entity().DSM_AXIS_4.subscribe(updateGeneratedText);
        self.Entity().LifeThreateningConditionPresent.subscribe(updateGeneratedText);
        self.DoGenerateText();

        self.SortModelProblems();
        self.DoSortProblems();

        $(".author-info").tooltip( { html: true });

        //activate the bootstrap filter switches
        $('.switch')['bootstrapSwitch']();
    };

    self.ShowResolved = ko.observable(true);
    self.ShowResolved.subscribe(function(newValue){
        self.DoSortProblems();
    });

    self.SortedProblems = ko.observableArray(self.Entity().Problems());
    self.SortColumn = ko.observable('Name');
    self.SortOrder = ko.observable('DESC');

    self.DoChangeSort = function(columnName) {
        if (self.SortColumn() == columnName) {
            var newSortOrder = (self.SortOrder() == "DESC" ? "ASC" : "DESC");
            self.SortOrder(newSortOrder);
        } else {
            self.SortOrder("DESC");
        }

        self.SortColumn(columnName);
        self.DoSortProblems();
    };

    self.DoSortProblems = function() {
        var items = [];

        _.each(self.Entity().Problems(), function (s) {
            if (!(!self.ShowResolved() && !s.IsActive())){
                items.push(s);
            }
        });

        items.sort(function(a, b) {

            var groupSort = 0;

            if (a.IsActive() != b.IsActive()) {
                if (a.IsActive()) {
                    groupSort = -1;
                } else {
                    groupSort = 1;
                }
            }

            if (groupSort == 0) {
                switch (self.SortColumn()) {
                    case "CurrentSeverity":
                        if (self.SortOrder() == "DESC") {
                            return a.CurrentSeverityName().localeCompare(b.CurrentSeverityName());
                        } else {
                            return (a.CurrentSeverityName().localeCompare(b.CurrentSeverityName())) * -1;
                        }
                    case "DateOfOnset":
                        var dateA = a.DateOfOnset();
                        var dateB = b.DateOfOnset();
                        if (self.SortOrder() == "DESC") {
                            return (dateA>dateB)-(dateA<dateB);
                        } else {
                            return ((dateA>dateB)-(dateA<dateB)) * -1;
                        }
                    case "ResolutionDate":
                        var dateA = a.ResolutionDate();
                        var dateB = b.ResolutionDate();
                        if (self.SortOrder() == "DESC") {
                            return (dateA>dateB)-(dateA<dateB);
                        } else {
                            return ((dateA>dateB)-(dateA<dateB)) * -1;
                        }
                    default:
                        if (self.SortOrder() == "DESC") {
                            return a.Name().localeCompare(b.Name());
                        } else {
                            return (a.Name().localeCompare(b.Name())) * -1;
                        }
                }
            }
        });

        self.SortedProblems(items);
    };

    self.SortModelProblems = function()
    {
        self.Entity().Problems.sort(function (left, right) {
            if (left.IsActive() === right.IsActive()) {
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
            }
            else {
                return (left.IsActive() === true ? -1 : 1)
            }
        });

        self.Entity().Problems.valueHasMutated();
    }

    self.DoGenerateText = function () {
        self.SortModelProblems();

        var resolvedProblemList = $("<ul/>");
        var unresolvedProblemList = $("<ul/>");
        var activeProblemCount = 0;
        var resolvedProblemCount = 0;

        _.each(self.Entity().Problems(), function (problem) {
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

            if (!SEE.util.IsPersonInfoEmpty(problem.ClinicianToCall()))
                sublist.append($("<li>Clinician to call about this problem: " +  SEE.util.formatPersonInfo(problem.ClinicianToCall()) + "</li>"));

            listItem.append(sublist);

            if (!problem.ResolutionDate()){
                activeProblemCount++;
                unresolvedProblemList.append(listItem);
            }
            else{
                resolvedProblemCount++;
                resolvedProblemList.append(listItem);
            }
        });

        // DSM AXIS
        var dsmEntries = [];

        if (self.Entity().DSM_AXIS_1() != "")
            dsmEntries.push("DSM Axis I: " + self.Entity().DSM_AXIS_1());
        if (self.Entity().DSM_AXIS_2() != "")
            dsmEntries.push("DSM Axis II: " + self.Entity().DSM_AXIS_2());
        if (self.Entity().DSM_AXIS_3() != "")
            dsmEntries.push("DSM Axis III: " + self.Entity().DSM_AXIS_3());
        if (self.Entity().DSM_AXIS_4() != "")
            dsmEntries.push("DSM Axis IV: " + self.Entity().DSM_AXIS_4());

        var dsm = SEE.util.xml.BuildHtmlList(dsmEntries);

        var doc = $("<root/>");

        if (activeProblemCount > 0) {
            var problemTitle = $("<h4/>");
            problemTitle.text("Active Problems");

            doc.append(problemTitle);
            doc.append(unresolvedProblemList);
        }

        if (resolvedProblemCount > 0) {
            var problemTitle = $("<h4/>");
            problemTitle.text("Resolved Problems");

            doc.append(problemTitle);
            doc.append(resolvedProblemList);
        }

        if (dsmEntries.length > 0) {
            var dsmTitle = $("<h4/>");
            dsmTitle.text("DSM Axes");
            doc.append(dsmTitle);
            doc.append(dsm);
        }

        if (self.Entity().LifeThreateningConditionPresent()) {
            var ltc = $("<p/>");
            ltc.text("A life limiting condition is present  (>50% possibility of death within 2 yrs)");
            doc.append(ltc);
        }


        var html = doc.html();

        self.Entity().GeneratedNarrative(html);
    };

    self.DisplayProblemModal = function () {
       self.InitializeTypeAhead();

        $("#ProblemModal").modal('show');
    };

    self.DoAddProblem = function () {
        self.SelectedProblem(new SEE.model.dto.ProblemSectionProblem());
        self.SelectedProblem().DateOfOnset(null);
        self.SelectedProblem().ResolutionDate(null);
        self.SelectedProblemIsNew(true);

        self.DisplayProblemModal();
    };

    self.DoSaveProblem = function () {

        $('#ProblemModal').modal('hide');

        self.SelectedProblem().Author(SEE.util.convertUserToAuthor(SEE.session.User));
        self.SelectedProblem().CurrentSeverityName(SEE.util.GetSeverityName(self.SelectedProblem().CurrentSeverity()));

        if (self.SelectedProblemIsNew()) {
            self.Entity().Problems.push(self.SelectedProblem());
        }
        else {
            var match = ko.utils.arrayFirst(self.Entity().Problems(), function (item) {
                return self.SelectedProblem().id() == item.id();
            });
            var i = self.Entity().Problems.indexOf(match);

            if (i > -1) {
                self.Entity().Problems.replace(self.Entity().Problems()[i], self.SelectedProblem());
            }
        }

        self.DoGenerateText();
        self.DoSortProblems();

        // Need to update the tooltips for authoring information
        $(".author-info").tooltip( { html: true });
    };

    self.DoCancelProblem = function () {
        if (!confirm("Any changes made to this dialog will be lost. Are you sure?")) {
            return;
        }

        $('#ProblemModal').modal('hide');
        self.SelectedProblem(new SEE.model.dto.ProblemSectionProblem());
    };

    self.DoEditProblem = function (data) {
        self.SelectedProblemIsNew(false);
        self.SelectedProblem(self.CloneProblem(data));
        self.DisplayProblemModal();
    };

    self.CloneProblem = function (p) {
        var mapping = {
            'ignore': ['IsActive', 'IsHighRisk', 'FullName']
        };

        var js = ko.mapping.toJS(p);
        var t = new SEE.model.dto.ProblemSectionProblem();
        ko.mapping.fromJS(js, mapping, t);
        return t;
    };

    self.DoRemoveProblem = function () {
        bootbox.confirm("Are you sure you want to delete this Problem entry? All data will be removed.", function(okPressed){
            if (okPressed){
                var data = ko.utils.arrayFirst(self.Entity().Problems(), function (item) {
                    return self.SelectedProblem().id() == item.id();
                });
                var index = _.indexOf(self.Entity().Problems(), data);
                if (index >= 0) {
                    self.Entity().Problems.splice(index, 1);
                    self.Entity().Problems.valueHasMutated();
                }

                self.DoCancelProblem();
                self.DoGenerateText();
                self.DoSortProblems();
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
                        self.FilteredProblems[item.SNOMED_FSN] = item;
                        filteredNames.push(item.SNOMED_FSN);
                    });
                    process(filteredNames);
                });
            },
            updater: function (item) {
                self.SelectedProblem.Name = item;
                self.SelectedProblem.Code = self.FilteredProblems[item.SNOMED_FSN];
                return item;
            },
            minLength: 1,
            display: 'SNOMED_FSN',
            val: 'SNOMED_CID'
        });
    };

    self.DiagnoserChanged = function(){
        self.DoGenerateText();
    };

    self.OnClickGAFScore = function() {
        self.ParentViewModel.NavigateToSection("FUNCTIONAL STATUS");
    };

    self.NavigateToResults = function() {
        self.ParentViewModel.NavigateToSection("RESULTS");
    };

    self.IsInvalidDateRange = function () {
        var dateOfOnset = self.SelectedProblem().DateOfOnset(),
            resolutionDate = self.SelectedProblem().ResolutionDate();

        if (!_.isDate(resolutionDate)) {
            return false;
        }

        return dateOfOnset > resolutionDate;
    };
};
SEE.viewmodel.document.section.ProblemSectionViewModel.inheritsFrom(SEE.viewmodel.document.section.BaseDocumentSection);