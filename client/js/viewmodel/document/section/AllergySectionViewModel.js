/// <reference path="../../../lib/external/crossroads/crossroads.js" />
/// <reference path="../../../lib/internal/model/ProblemSectionProblem.js" />
SEE.namespace("SEE.viewmodel.document.section");

SEE.viewmodel.document.section.AllergySectionViewModel = function () {
    SEE.viewmodel.document.section.BaseDocumentSection.prototype.init.call(this);

    var self = this;

    self.Title("ALLERGIES");
    self.UI.EditTemplateName("document/section/AllergySection.html");

    self.Entity = ko.observable(new SEE.model.dto.AllergySection());
    self.NewAllergy = ko.observable(new SEE.model.dto.AllergyEntry());    

    var sortEntries = function () {
        self.Entity().Allergies.sort(function (a, b) {

            if (a.NoticeDate() == b.NoticeDate()) {
                return a.AllergyTo() < b.AllergyTo();
            }

            return a.NoticeDate() < b.NoticeDate();
        });
    };

    var initializeControls = function() {
        $(".author-info").tooltip( { html: true });
    };

    self.LoadEntity = function (document) {
        //call base class
        SEE.viewmodel.document.section.BaseDocumentSection.prototype.LoadEntity.call(self, document);

        self.Entity().KnownAdverseEvents.subscribe(self.DoGenerateText);
        self.Entity().PotentialAdverseEvents.subscribe(self.DoGenerateText);

        sortEntries();
        self.Entity().Commit(); //clear any changes from sorting
    };

    self.OnAfterRender = function () {
        initializeControls();
    };

    self.DoGenerateText = function () {

        var doc = $("<root/>");

        if (self.Entity().Allergies().length > 0) {
            var headers = ["Allergy To", "Type", "Severity", "Reaction", "Date Noticed"];
            var rows = [];

            _.each(self.Entity().Allergies(), function (x) {
                var newRow = [];

                var formattedDate =  SEE.util.GetFormattedDate(x.NoticeDate());

                newRow.push(x.AllergyTo());
                newRow.push(x.AllergyType());
                newRow.push(x.SeverityName());
                newRow.push(x.Reaction());
                newRow.push(formattedDate);

                rows.push(newRow);
            });

            doc.append($("<h4>Allergies</h4>"))
            doc.append(SEE.util.xml.CreateHtmlTable(headers, "", rows));
            doc.append($("<br />"))
        }

        if (self.Entity().KnownAdverseEvents() != "") {
            var p = $("<p/>");
            doc.append($("<strong>Known Adverse Events: </strong>"))
            p.text(self.Entity().KnownAdverseEvents());
            doc.append(p);
        }

        if (self.Entity().PotentialAdverseEvents() != "") {
            var p = $("<p/>");

            p.text(self.Entity().PotentialAdverseEvents());
            doc.append($("<strong>Potential Adverse Events: </strong>"))
            doc.append(p);
        }

        self.Entity().GeneratedNarrative(doc.html());

    };

    self.CloneAllergy = function (p) {
        var mapping = { };

        var js = ko.mapping.toJS(p);
        var t = new SEE.model.dto.AllergyEntry();
        ko.mapping.fromJS(js, mapping, t);
        return t;
    };

    self.DoAddAllergy = function () {
        self.Entity().Allergies.push(self.NewAllergy())
        self.NewAllergy(new SEE.model.dto.AllergyEntry());

        self.DoGenerateText();

        initializeControls();
    };

    self.DoRemoveAllergy = function (data) {
        bootbox.confirm("Are you sure you want to delete this Allergy entry? All data will be removed.", function(okPressed){
            if (okPressed){
                var index = _.indexOf(self.Entity().Allergies(), data);
                if (index >= 0) {
                    self.Entity().Allergies().splice(index, 1);
                    self.Entity().Allergies.valueHasMutated();
                }

                self.DoGenerateText();
            }
        });
    };
};

SEE.viewmodel.document.section.AllergySectionViewModel.inheritsFrom(SEE.viewmodel.document.section.BaseDocumentSection);