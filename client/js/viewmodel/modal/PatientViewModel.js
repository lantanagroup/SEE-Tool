/// <reference path="../../lib/external/underscore/underscore.js" />
SEE.namespace("SEE.viewmodel.modal");

SEE.viewmodel.modal.PatientViewModel = function () {
    var self = this;

    this.init();
    self.Name = "PatientViewModel";
    self.UI.TemplateName("modal/Patient.html");
    self.Entity(new SEE.model.dto.Patient());
    self.AssigningAuthorityList = ko.observableArray();
    self.HasLoaded = ko.observable(false);


    self.OnSuccess = null;
    self.OnCancel = null;

    self.Initialize = function (onsuccess) {
        SEE.service.DocumentService.RetrieveAssigningAuthorityList(SEE.session.User.GroupIdentifier, function (list) {
            self.AssigningAuthorityList([]);
            _.each(list, function (item) {
                self.AssigningAuthorityList().push(item);
            });
            self.AssigningAuthorityList.valueHasMutated();
            onsuccess();
        });        
    };

    self.LoadEntity = function (patient, onsuccess, oncancel) {
        var p = new SEE.model.dto.Patient();
        if (!_.isNull(patient)) {
            p.fromJS.call(p, patient);
        }
        self.Entity(p);

        self.OnSuccess = onsuccess;
        self.OnCancel = oncancel;

        self.HasLoaded(true);
    };

    self.OnAfterRender = function () {

    };

    self.Cancel = function () {
        if (self.OnCancel) {
            self.OnCancel();
        }
    };

    self.SaveEntity = function () {
        if (self.OnSuccess) {
            self.OnSuccess(self.Entity());
        }
    };

    self.DoCancel = function () {
        if (!confirm("Any changes made to this dialog will be lost. Are you sure?")) {
            return;
        }

        SEE.session.MainVM.Modal.Close();
        self.Cancel();
    };

    self.DoSave = function () {
        self.SaveEntity();
        SEE.session.MainVM.Modal.Close();
    };

    self.DoRemoveIdentifier = function (data) {
        var target = _.find(self.Entity().PersonInfo.Identifiers(), function (iid) {
            return data._oid_ === iid._oid_;
        });

        if (target) {
            var index = self.Entity().PersonInfo.Identifiers().indexOf(target);
            if (index >= 0) {
                self.Entity().PersonInfo.Identifiers().splice(index, 1);
                self.Entity().PersonInfo.Identifiers.valueHasMutated();

                if (self.Entity().PersonInfo.Identifiers().length === 0) {
                    self.DoAddNewIdentifier();
                }
            }
        };
    };

    self.DoAddNewIdentifier = function () {
        var iid = new SEE.model.dto.InstanceIdentifier();
        self.Entity().PersonInfo.Identifiers.push(iid);
        self.Entity().PersonInfo.Identifiers.valueHasMutated();
    };
};

SEE.viewmodel.modal.PatientViewModel.inheritsFrom(SEE.viewmodel.modal.BaseModal);