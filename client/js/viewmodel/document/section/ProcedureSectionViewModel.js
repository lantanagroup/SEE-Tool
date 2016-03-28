/// <reference path="../../../lib/external/crossroads/crossroads.js" />
/// <reference path="../../../session.js" />
SEE.namespace("SEE.viewmodel.document.section");

SEE.viewmodel.document.section.ProcedureSectionViewModel = function () {
    SEE.viewmodel.document.section.BaseDocumentSection.prototype.init.call(this);

    var self = this;

    self.Title("PROCEDURES");
    self.UI.EditTemplateName("document/section/ProcedureSection.html");

    self.Entity = ko.observable(new SEE.model.dto.ProcedureSection());
    self.NewProcedureOrder = ko.observable(new SEE.model.dto.ProcedureOrderEntry());
    self.ParentViewModel = {};
    self.SelectedProcedureIsNew = ko.observable(true);

    var getNameFromCode = function(code) {
        switch (code) {
            case "1":
                return "Suction";
            case "2":
                return "Vascular Access (central line)";
            case "3":
                return "Urinary Catheter";
            case "4":
                return "Dialysis";
            case "5":
                return "Chemotherapy";
            case "6":
                return "Radiation Therapy";
            case "7":
                return "Total Parenteral Nutrition";
            case "8":
                return "Tracheostomy Care";
            case "9":
                return "Ventilatory Management";
            case "10":
                return "Fluid Restriction";
            case "11":
                return "Glucose Monitoring";
            case "12":
                return "Setting Decision/Change";
            case "13":
                return "Nutritional Supports";
            case "14":
                return "Lifestyle Modifications";
            case "15":
                return "Personal Supportive Services";
            case "16":
                return "Restorative Services";
            case "17":
                return "Health Maintenance/Disease Management Tests/Procedures";
        }
    };

    var getList = function(listName, bareList) {
        if (listName == "Common") {
            if (bareList) {
                return self.Entity().CommonTreatments;
            } else {
                return self.Entity().CommonTreatments();
            }
        }
        else if (listName == "Specialized") {
            if (bareList) {
                return self.Entity().SpecializedTreatments;
            } else {
                return self.Entity().SpecializedTreatments();
            }
        }
        else if (listName == "Other") {
            if (bareList) {
                return self.Entity().OtherTreatments;
            } else {
                return self.Entity().OtherTreatments();
            }
        }

        return null;
    };

    var initializeControls = function() {
        //var DATE_RANGE = "c-100:+10";
        $(".author-info").tooltip( { html: true });
        //$(".datePicker").datepicker({ showButtonPanel: true, changeMonth: true, changeYear: true, yearRange: DATE_RANGE });
    };

    self.OnAfterRender = function () {
        initializeControls();
    };

    self.DoGenerateText = function () {
        var orderHeaders = ["Name", "Orderer", "Amount", "Frequency", "Duration", "Outcome", "Start/Chg Date"];
        var orderRows = [];

        _.each(self.Entity().ProcedureOrders(), function (s) {
            var newRow = [];

            newRow.push(s.Name());
            newRow.push(s.Orderer().FullName());
            newRow.push(s.Amount());
            newRow.push(s.Frequency());
            newRow.push(s.Duration());
            newRow.push(s.Outcome());
            newRow.push(SEE.util.GetFormattedDate(s.StartChangeDate()));

            orderRows.push(newRow);
        });

        var html = "<br/>";
        if (orderRows.length > 0) {
            html = SEE.util.xml.CreateHtmlTable(orderHeaders, "Procedure Orders", orderRows);
        }

        var sortOrder = function(a, b) {
            return a.Code().localeCompare(b.Code());
        };

        if (self.Entity().CommonTreatments().sort(sortOrder).length > 0) {
            html += "<br/>";

            var rows = prepareTreatments(self.Entity().CommonTreatments());

            html += SEE.util.xml.CreateHtmlList(rows, "Common Treatments");
        }

        if (self.Entity().SpecializedTreatments().sort(sortOrder).length > 0) {
            html += "<br/>";

            var rows = prepareTreatments(self.Entity().SpecializedTreatments());

            html += SEE.util.xml.CreateHtmlList(rows, "Specialized Treatments");
        }

        if (self.Entity().OtherTreatments().sort(sortOrder).length > 0) {
            html += "<br/>";

            var rows = prepareTreatments(self.Entity().OtherTreatments());

            html += SEE.util.xml.CreateHtmlList(rows, "Other Treatments");
        }

        self.Entity().GeneratedNarrative(html);
    };

    var prepareTreatments = function(list){
        var rows = [];

        _.each(list, function(s) {
            var dateString =  "";;

            if (s.EffectiveDate())
                dateString =  " (" + SEE.util.GetFormattedDate(s.EffectiveDate()) + ")";

            var detail = s.Name();

            if (detail != "")
                detail = ": " + detail;

            var newRow = getNameFromCode(s.Code()) + detail + dateString;
            rows.push(newRow);
        });

        return rows;
    }


    self.DisplayProcedureModal = function () {

        $("#ProcedureModal").modal('show');
    };

    self.DoAddProcedure = function () {
        //self.NewProcedureOrder().Author(SEE.util.convertUserToAuthor(SEE.session.User));

        //self.Entity.ProcedureOrders.push(self.NewProcedureOrder());
        self.NewProcedureOrder(new SEE.model.dto.ProcedureOrderEntry());
        self.SelectedProcedureIsNew(true);
        self.NewProcedureOrder().StartChangeDate(null);
        //initializeControls();

        self.DisplayProcedureModal();
    };

    self.DoEditProcedure = function (data) {
        self.SelectedProcedureIsNew(false);
        self.NewProcedureOrder(self.CloneProcedure(data));
        self.DisplayProcedureModal();
    };

    self.CloneProcedure = function (p) {

        var js = ko.mapping.toJS(p);
        var t = new SEE.model.dto.ProcedureOrderEntry();
        ko.mapping.fromJS(js, null, t);
        return t;
    };

    self.DoSaveProcedure = function () {

        $('#ProcedureModal').modal('hide');

        self.NewProcedureOrder().Author(SEE.util.convertUserToAuthor(SEE.session.User));

        if(self.SelectedProcedureIsNew()){
            self.Entity().ProcedureOrders.push(self.NewProcedureOrder());
        }
        else {
            var match = ko.utils.arrayFirst(self.Entity().ProcedureOrders(), function (item) {
                return self.NewProcedureOrder().id() == item.id();
            });
            var i = self.Entity().ProcedureOrders.indexOf(match);

            if (i > -1) {
                self.Entity().ProcedureOrders.replace(self.Entity().ProcedureOrders()[i], self.NewProcedureOrder());
            }
        }
        //self.NewProcedureOrder(new SEE.model.dto.ProcedureOrderEntry());

        self.DoGenerateText();
        initializeControls()
    };

    self.DoCancelModal = function () {
        if (!confirm("Any changes made to this dialog will be lost. Are you sure?")) {
            return;
        }

        $('#ProcedureModal').modal('hide');
        self.NewProcedureOrder(new SEE.model.dto.ProcedureOrderEntry());
    };
    /********************************
     *       TREATMENTS
     ********************************/

    self.GetTreatments = function(listName, code) {
        var retArray = [];

        _.each(getList(listName), function(s) {
            if (s.Code() == code) {
                retArray.push(s);
            }
        });

        return retArray;
    };

    self.DoRemoveTreatment = function(listName, data) {
        bootbox.confirm("Are you sure you want to delete this treatment?", function(okPressed){
            if (okPressed){
                var list = getList(listName);
                var bareList = getList(listName, true);
                var index = _.indexOf(list, data);

                if (index >= 0) {
                    list.splice(index, 1);
                    bareList.valueHasMutated();
                }

                self.DoGenerateText();

                initializeControls();
            }
        });
    };

    self.DoAddTreatment = function(listName, code) {
        var list = getList(listName);
        var codeListCount = 0;

        var newTreatment = new SEE.model.dto.TreatmentEntry();
        newTreatment.Author(SEE.util.convertUserToAuthor(SEE.session.User));
        newTreatment.Code(code);
        list.push(newTreatment);

        _.each(list, function(s) {
            if (s.Code() == code) {
                codeListCount++;
            }
        });

        _.each($('.treatment'), function(s) {
            ko.cleanNode(s);
            ko.applyBindings(self, s);
        });

        initializeControls();

        var nameControlId = '#treatmentName_' + code + '_' + (codeListCount-1).toString();
        $(nameControlId).focus();

        self.DoGenerateText();
    };

    self.DoRemoveProcedure = function(procedureOrder) {
        bootbox.confirm("Are you sure you want to delete this Procedure Order entry? All data will be removed.", function(okPressed) {
            if (okPressed){
                var data = ko.utils.arrayFirst(self.Entity().ProcedureOrders(), function (item) {
                    return procedureOrder.id() == item.id();
                });
                var index = _.indexOf(self.Entity().ProcedureOrders(), data);

                if (index >= 0) {
                    self.Entity().ProcedureOrders().splice(index, 1);
                    self.Entity().ProcedureOrders.valueHasMutated();
                }

                self.DoGenerateText();
                self.DoCancelModal();
            }
        });
    };
};

SEE.viewmodel.document.section.ProcedureSectionViewModel.inheritsFrom(SEE.viewmodel.document.section.BaseDocumentSection);