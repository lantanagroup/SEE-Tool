/// <reference path="../../lib/external/underscore/underscore.js" />
SEE.namespace("SEE.viewmodel.modal");

SEE.viewmodel.modal.OrganizationInfoViewModel = function () {
    var self = this;

    this.init();
    self.Name = "OrganizationInfoViewModel";
    self.UI.TemplateName("modal/OrganizationInfo.html");
    self.Entity(new SEE.model.dto.OrganizationInfo());

    self.OnSuccess = null;
    self.OnCancel = null;

    self.FieldValidator = null;

    self.LoadEntity = function (organizationInfo, onsuccess, oncancel, addvalidators) {
        var o = new SEE.model.dto.OrganizationInfo();
        if (!_.isNull(organizationInfo)) {
            o.fromJS.call(o, organizationInfo);
        }

        if (addvalidators) {
            addvalidators(o);
        }

        self.Entity(o);
        self.OnSuccess = onsuccess;
        self.OnCancel = oncancel;
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
        var target = _.find(self.Entity().Identifiers(), function (iid) {
            return data._oid_ === iid._oid_;
        });

        if (target) {
            var index = self.Entity().Identifiers().indexOf(target);
            if (index >= 0) {
                self.Entity().Identifiers().splice(index, 1);
                self.Entity().Identifiers.valueHasMutated();

                if (self.Entity().Identifiers().length === 0) {
                    self.DoAddNewIdentifier();
                }
            }
        };
    };

    self.DoAddNewIdentifier = function () {
        var iid = new SEE.model.dto.InstanceIdentifier();
        self.Entity().Identifiers.push(iid);
        self.Entity().Identifiers.valueHasMutated();
    }


    self.rootHasError = ko.computed(function () {
        var isInvalid = _.find(self.Entity().Identifiers(), function (id) {
            if (id.Root.hasError && id.Root.hasError()) {
                return true;
            }
        });

        return !_.isEmpty(isInvalid);
    });

    self.extensionHasError = ko.computed(function () {
        var isInvalid = _.find(self.Entity().Identifiers(), function (id) {
            if (id.Extension.hasError && id.Extension.hasError()) {
                return true;
            }
        });

        return !_.isEmpty(isInvalid);
    });

    self.hasError = ko.computed(function () {
        return self.Entity().Name.hasError() || self.Entity().StreetAddress.hasError() || self.Entity().City.hasError() || self.extensionHasError();
    });
};

SEE.viewmodel.modal.OrganizationInfoViewModel.inheritsFrom(SEE.viewmodel.modal.BaseModal);