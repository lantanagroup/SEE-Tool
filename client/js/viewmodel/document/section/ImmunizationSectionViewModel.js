SEE.namespace("SEE.viewmodel.document.section");

SEE.viewmodel.document.section.ImmunizationSectionViewModel = function () {
    SEE.viewmodel.document.section.BaseDocumentSection.prototype.init.call(this);

    var self = this;

    self.Title("IMMUNIZATIONS");
    self.UI.EditTemplateName("document/section/ImmunizationSection.html");
    self.Entity = ko.observable(new SEE.model.dto.ImmunizationSection());
    self.NewImmunization = ko.observable(new SEE.model.dto.ImmunizationEntry());

    var sortEntries = function () {
        self.Entity().Immunizations.sort(function (a, b) {
            //return a.Name() < b.Name();

            return a.EffectiveTime() > b.EffectiveTime();
        });
    };

    var initializeControls = function() {
        $(".author-info").tooltip( { html: true });
    };

    self.DoGenerateText = function () {
        var headers = ["Name", "Route", "Dose", "Details", "Effective Time"];
        var rows = [];

        sortEntries();

        _.each(self.Entity().Immunizations(), function (x) {
            var newRow = [];
            var formattedDate =  SEE.util.GetFormattedDate(x.EffectiveTime());
            newRow.push(x.Name());
            newRow.push(x.Route());
            newRow.push(x.Dose());
            newRow.push(x.Details());
           // newRow.push($.datepicker.formatDate("mm/dd/yy", x.EffectiveTime()));
            newRow.push(formattedDate);
            rows.push(newRow);
        });

        var text = "";

        if (rows.length > 0)
            text = SEE.util.xml.CreateHtmlTable(headers, "", rows);

        self.Entity().GeneratedNarrative(text);
    };

    self.OnAfterRender = function () {
        initializeControls();
    };

    self.SaveEntity = function (document) {
        _.each(self.Entity().Immunizations(), function(s) {
            if (s.Name() == '') {
                $(".immunizationName").filter(function() { return $(this).val() == ''; })[0].focus();       // Focus the first immunization name that doesn't have a value
                throw "Immunizations validation failed.";   // Throw an error so that the document knows not to finish saving
            }
        });

        //call base class
        SEE.viewmodel.document.section.BaseDocumentSection.prototype.SaveEntity.call(self, document);
    };

    self.DoAddImmunization = function () {
        self.NewImmunization().Author(SEE.util.convertUserToAuthor(SEE.session.User));
        self.Entity().Immunizations.push(self.NewImmunization());

        self.NewImmunization(new SEE.model.dto.ImmunizationEntry());

        self.DoGenerateText();
        initializeControls();
    };

    self.DoRemoveImmunization = function (data) {
        bootbox.confirm("Are you sure you want to delete this Immunization entry? All data will be removed.", function(okPressed){
            if (okPressed){
                var index = _.indexOf(self.Entity().Immunizations(), data);
                if (index >= 0) {
                    self.Entity().Immunizations().splice(index, 1);
                    self.Entity().Immunizations.valueHasMutated();
                }

                self.DoGenerateText();
            }
        });
    };

    self.DoImportImmunization = function () {
    };
};

SEE.viewmodel.document.section.ImmunizationSectionViewModel.inheritsFrom(SEE.viewmodel.document.section.BaseDocumentSection);