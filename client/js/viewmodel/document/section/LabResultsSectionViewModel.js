SEE.namespace("SEE.viewmodel.document.section");

SEE.viewmodel.document.section.LabResultsSectionViewModel = function () {
    SEE.viewmodel.document.section.BaseDocumentSection.prototype.init.call(this);

    var self = this;

    self.Title("LAB RESULTS");
    self.UI.EditTemplateName("document/section/LabResultsSection.html");

    self.Entity = ko.observable(new SEE.model.dto.ResultsSection());

    var initializeControls = function() {
        //var DATE_RANGE = "c-100:+10";
        $(".author-info").tooltip( { html: true });
        //$(".datePicker").datepicker({ showButtonPanel: true, changeMonth: true, changeYear: true, yearRange: DATE_RANGE });
    };

    self.GetItems = function(name) {
        var retArray = [];

        _.each(self.Entity().LabResults(), function(s) {
            if (s.Name() == name) {
                retArray.push(s);
            }
        });

        return retArray;
    };

    self.DoAddItem = function(name, defaultUnit) {
        var list = null;

        var codeListCount = 0;

        var newItem = new SEE.model.dto.LabResult();
        newItem.Author(SEE.util.convertUserToAuthor(SEE.session.User));


        //newItem.Name(name);


        newItem.Unit(defaultUnit);

        if (name != "Other Significant Lab Results"){
            list = self.Entity().LabResults;
            newItem.Name(name);
        }
        else
        {
            list = self.Entity().OtherLabResults;
        }

        list.push(newItem);

        _.each(list, function(s) {
            if (s.Name() == name) {
                codeListCount++;
            }
        });

        _.each($('.treatment'), function(s) {
            ko.cleanNode(s);
            ko.applyBindings(self, s);
        });

        initializeControls();

       // var nameControlId = '#treatmentName_' + code + '_' + (codeListCount-1).toString();
        //$(nameControlId).focus();

        self.DoGenerateText();
    };

    self.DoRemoveItem = function(data, isCustom) {
        bootbox.confirm("Are you sure you want to delete this Result entry? All data will be removed.", function(okPressed){
            if (okPressed){
                var list = null;

                if (isCustom){
                    list = self.Entity().OtherLabResults;
                }
                else{
                    list = self.Entity().LabResults;
                }

                list.remove(function (item){return item.id == data.id});

                self.DoGenerateText();

                initializeControls();
            }
        });
    };

    self.DoGenerateText = function () {
        var headers = ["Test Name", "Value", "Unit", "Date Observed"];
        var rows = [];

        var allResults = self.Entity().LabResults().concat(self.Entity().OtherLabResults());

        _.each(allResults, function (item) {
            var newRow = [];

            newRow.push(item.Name() || "");
            newRow.push(item.Value() || "");
            newRow.push(item.Unit() || "");

            if (item.DateObserved() && item.DateObserved() != "") {
                var date = SEE.util.GetFormattedDate(item.DateObserved());

                newRow.push(date);
            }
            else
                newRow.push("");

            rows.push(newRow);
        });



        var html = "<br/>";

        if (rows.length > 0) {
            html = SEE.util.xml.CreateHtmlTable(headers, "", rows);
        }

        self.Entity().GeneratedNarrative(html);
    };

}

SEE.viewmodel.document.section.LabResultsSectionViewModel.inheritsFrom(SEE.viewmodel.document.section.BaseDocumentSection);