SEE.namespace("SEE.viewmodel.document.section");

SEE.viewmodel.document.section.MedicalEquipmentSectionViewModel = function () {
    SEE.viewmodel.document.section.BaseDocumentSection.prototype.init.call(this);

    var self = this;

    self.Title("MEDICAL EQUIPMENT");
    self.UI.EditTemplateName("document/section/MedicalEquipmentSection.html");
    self.Entity = ko.observable(new SEE.model.dto.MedicalEquipmentSection());

    self.Columns = {};
    self.Columns.What = 0;
    self.Columns.Where = 1;
    self.Columns.When = 2;
    self.Columns.SuppliesOrdered = 3;
    self.Columns.SuppliesSent = 4;
    self.Columns.EffectiveTime = 5;
    self.Sort = {};
    self.Sort.Column = ko.observable(self.Columns.What);
    self.Sort.PropertyName = ko.observable("What");
    self.Sort.Ascending = 1;
    self.Sort.Descending = -1;
    self.Sort.Direction = ko.observable(self.Sort.Ascending);
    self.Sort.currentSortDirection = self.Sort.Direction();
    self.Sort.currentPropertyName = self.Sort.PropertyName();

    self.EditRowIndex = ko.observable(-1);

    self.NewSupply = ko.observable(new SEE.model.dto.MedicalSupplyEntry());
    self.NewEquipment = ko.observable(new SEE.model.dto.MedicalEquipmentEntry());
    self.SelectedSupply = ko.observable(new SEE.model.dto.MedicalSupplyEntry());

    // TABLE SORTING
    self.SortIcon = function () {
        if (self.Sort.Direction() === self.Sort.Ascending) {
            return "icon-chevron-up";
        }

        return "icon-chevron-down";
    };

    self.ShowIcon = function (column) {
        if (column === self.Sort.Column()) {
            return true;
        }

        return false;
    };

    self.doColumnClick = function (column, name) {
        self.doSort(column, name);
    };

    self.doSort = function (column, name) {
        var sortfunction;

        if (!_.isUndefined(column)) {
            if (column === self.Sort.Column()) {
                self.Sort.Direction(self.Sort.Direction() * -1);
            }
            else {
                self.Sort.Direction(self.Sort.Ascending);
            }
            self.Sort.Column(column);
            self.Sort.PropertyName(name);
        }
        else {
            column = self.Columns.What;
        }


        sortfunction = self.textColumnSorter;
        if (column === self.Columns.EffectiveTime) {
            sortfunction = self.dateColumnSorter;
        }
        else if (column === self.Columns.SuppliesOrdered | column === self.Columns.SuppliesSent) {
            sortfunction = self.boolColumnSorter;
        }

        self.Sort.currentSortDirection = self.Sort.Direction();
        self.Sort.currentPropertyName = self.Sort.PropertyName();
        self.Entity().Supplies.sort(sortfunction);
    };

    self.textColumnSorter = function (l, r) {
        var lname = l[self.Sort.currentPropertyName]().toLowerCase(),
            rname = r[self.Sort.currentPropertyName]().toLowerCase();
        if (lname === rname) {
            return 0;
        } else if (lname < rname) {
            return -1 * self.Sort.currentSortDirection;
        } else if (lname > rname) {
            return 1 * self.Sort.currentSortDirection;
        }
    };

    self.boolColumnSorter = function (l, r) {        
        if (l[self.Sort.currentPropertyName]() === r[self.Sort.currentPropertyName]()) {
            return 0;
        } else if (l[self.Sort.currentPropertyName]() < r[self.Sort.currentPropertyName]()) {
            return 1 * self.Sort.currentSortDirection;
        } else if (l[self.Sort.currentPropertyName]() > r[self.Sort.currentPropertyName]()) {
            return -1 * self.Sort.currentSortDirection;
        }
    };

    self.dateColumnSorter = function (l, r) {
        var ld = Date.parse(l[self.Sort.currentPropertyName]()), rd = Date.parse(r[self.Sort.currentPropertyName]());
        if (ld === rd) {
            return 0;
        } else if (ld < rd) {
            return -1 * self.Sort.currentSortDirection;
        } else if (ld > rd) {
            return 1 * self.Sort.currentSortDirection;
        }
    };
    
    self.LoadEntity = function (document) {
        //call base class
        SEE.viewmodel.document.section.BaseDocumentSection.prototype.LoadEntity.call(self, document);
        self.Entity().Commit(); //clear changed flag
    };

    self.SaveEntity = function (document) {
        self.DoGenerateText();
        self.Entity().Author(SEE.util.convertUserToAuthor(SEE.session.User));
        //call base class
        SEE.viewmodel.document.section.BaseDocumentSection.prototype.SaveEntity.call(self, document);
    };

    self.DoGenerateText = function () {
        var equipment = [];
        var supplies = [];

        _.each(self.Entity().MedicalEquipment(), function (item, index) {
            var text = item.Name();
            if (item.Details()){
                text += " - " + item.Details() + " - ";
            }
            if (item.EffectiveTime()){
                text += " - " + SEE.util.GetFormattedDate(item.EffectiveTime()) + " - ";
            }

            equipment.push(text);
        });

        _.each(self.Entity().Supplies(), function (item, index) {
            var text = item.What();
            if (item.Where()){
                text += " - " + item.Where() + " - ";
            }
            if (item.EffectiveTime()){
                text += " - " + SEE.util.GetFormattedDate(item.EffectiveTime()) + " - ";
            }

            if (item.SuppliesOrdered()){
                text += " - Supplies ordered - ";
            }
            else
            {
                text += " - Supplies NOT ordered - ";
            }

            if (item.SuppliesSent()){
                text += " - Supplies sent";
            }
            else
            {
                text += " - Supplies NOT sent";
            }
            supplies.push(text);
            //supplies.push(item.What() + " - " + item.Where() + " - " + item.EffectiveTime() + " - Ordered: " + (item.SuppliesOrdered() ? 'Yes' : 'No') + " - Sent: " + (item.SuppliesSent() ? 'Yes' : 'No')));
        });        

        var equipmentList = SEE.util.xml.BuildHtmlList(equipment);
        var supplierList = SEE.util.xml.BuildHtmlList(supplies);

        var doc = $("<root/>");

        if (equipment.length > 0) {
            var title = $("<h4/>");
            title.text("Medical Equipment");
            doc.append(title);
            doc.append(equipmentList);
        }
        if (supplies.length > 0) {
            var title = $("<h4/>");
            title.text("Supplies");
            doc.append(title);
            doc.append(supplierList);
        }

        var html = doc.html();
        self.Entity().GeneratedNarrative(html);
    };

    self.DoAddEquipment = function () {
        self.Entity().MedicalEquipment().push(self.NewEquipment());
        self.Entity().MedicalEquipment.valueHasMutated();
        self.NewEquipment(new SEE.model.dto.MedicalEquipmentEntry());
        self.DoGenerateText();
    };
    self.DoRemoveEquipment = function (data) {
        bootbox.confirm("Are you sure you want to delete this medical equipment entry? All data will be removed.", function(okPressed){
            if (okPressed){
                var index = -1;
                _.forEach(self.Entity().MedicalEquipment(), function (item, i) {
                    if (item == data) { index = i; };
                });
                if (index >= 0) {
                    self.Entity().MedicalEquipment.splice(index, 1);
                    self.Entity().MedicalEquipment.valueHasMutated();
                }

                self.DoGenerateText();
            }
        });
    };
    self.DoAddNewSupply = function () {
        self.Entity().Supplies().push(self.NewSupply());
        self.Entity().Supplies.valueHasMutated();
        self.NewSupply(new SEE.model.dto.MedicalSupplyEntry());
        self.DoGenerateText();
    };

    self.DoRemoveSupply = function (data) {
        if (confirm("Are you sure you want to delete this supply entry? All data will be removed.")) {            
            var index = -1;
            _.forEach(self.Entity().Supplies(), function (item, i) {
                if (item == data) { index = i; };
            });
            if (index >= 0) {
                self.Entity().Supplies.splice(index, 1);
                self.Entity().Supplies.valueHasMutated();
            }

            self.DoGenerateText();
        }
    };

    self.CloneSupply = function (p) {
        var mapping = {};

        var js = ko.mapping.toJS(p);
        var t = new SEE.model.dto.MedicalSupplyEntry();
        ko.mapping.fromJS(js, mapping, t);
        return t;
    };
};

SEE.viewmodel.document.section.MedicalEquipmentSectionViewModel.inheritsFrom(SEE.viewmodel.document.section.BaseDocumentSection);