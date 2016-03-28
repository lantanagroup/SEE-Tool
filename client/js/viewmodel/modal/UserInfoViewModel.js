/// <reference path="../../lib/external/underscore/underscore.js" />
SEE.namespace("SEE.viewmodel.modal");

SEE.viewmodel.modal.UserInfoViewModel = function () {    
    var self = this;

    this.init();
    self.Name = "UserInfoViewModel";
    self.UI.TemplateName(".././view/shared/UserInfo.html");
    self.Entity(new SEE.model.dto.User());
    self.OnSuccess = null;
    self.OnCancel = null;
    self.Title = ko.observable("Edit User Info");
    self.AssigningAuthorityList = ko.observableArray();


    self.LoadEntity = function (user, onsuccess, oncancel) {
        
       var u = new SEE.model.dto.User();

        if (!_.isNull(user)) {
            u.fromJS.call(u, user);
        }

        self.Entity(u);

        self.OnSuccess = onsuccess;
        self.OnCancel = oncancel;

        SEE.service.DocumentService.RetrieveAssigningAuthorityList(self.Entity().GroupIdentifier(), function (list) {
            self.AssigningAuthorityList([]);
            _.each(list, function (item) {
                self.AssigningAuthorityList().push(item);
            });
            self.AssigningAuthorityList.valueHasMutated();
        });
    };


    self.Cancel = function () {
        if (self.OnCancel) {
            self.OnCancel();
        }
    };

    self.SaveEntity = function () {
        if (self.OnSuccess) {
            self.OnSuccess(self.Entity().toJS());
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
            var index = self.Entity().PersonInfo.Identifiers.indexOf(target);
            if (index >= 0) {
                self.Entity().PersonInfo.Identifiers.splice(index, 1);
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

    self.IsValidIdentifiers = function () {
        var invalid = _.find(self.Entity().PersonInfo.Identifiers(), function (iid) {
            return _.isUndefined(iid.Extension()) || _.isNull(iid.Extension()) ||
                _.isUndefined(iid.Root()) || _.isNull(iid.Root()) || _.isEmpty(iid.Extension());
        });

        return _.isUndefined(invalid) || _.isNull(invalid);
    };

    self.IsValid = ko.computed(function() {
        return self.IsValidIdentifiers() && !self.Entity().PersonInfo.FirstName.hasError() && !self.Entity().PersonInfo.LastName.hasError() && !self.Entity().PersonInfo.City.hasError() && !self.Entity().PersonInfo.StreetAddress.hasError();
    });


};

SEE.viewmodel.modal.UserInfoViewModel.inheritsFrom(SEE.viewmodel.modal.BaseModal);