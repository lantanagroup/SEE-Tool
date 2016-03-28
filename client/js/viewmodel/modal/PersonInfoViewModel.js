/// <reference path="../../lib/external/underscore/underscore.js" />
SEE.namespace("SEE.viewmodel.modal");

SEE.viewmodel.modal.PersonInfoViewModel = function () {    
    var self = this;

    this.init();
    self.Name = "PersonInfoViewModel";
    self.UI.TemplateName("modal/PersonInfo.html");
    self.Entity(new SEE.model.dto.PersonInfo());
    self.AssigningAuthorityList = ko.observableArray();
    self.OnSuccess = null;
    self.OnCancel = null;
    self.Title = ko.observable("Edit Person");


    self.LoadEntity = function (personInfo, onsuccess, oncancel) {
        var p = new SEE.model.dto.PersonInfo();
        if (!_.isNull(personInfo)) {
            p.fromJS.call(p, personInfo);
        }
        self.Entity(p);

        self.OnSuccess = onsuccess;
        self.OnCancel = oncancel;

        SEE.service.DocumentService.RetrieveAssigningAuthorityList(SEE.session.User.GroupIdentifier, function (list) {
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

//                if (self.Entity().Identifiers().length === 0) {
//                    self.DoAddNewIdentifier();
//                }
            }
        };
    };


    self.DoAddNewIdentifier = function () {
        var iid = new SEE.model.dto.InstanceIdentifier();
        self.Entity().Identifiers.push(iid);
        self.Entity().Identifiers.valueHasMutated();
    };

    /*
    self.IsInvalidIdentifier = function (iid) {
        return _.isUndefined(iid.Extension()) || _.isNull(iid.Extension()) ||
            _.isUndefined(iid.Root()) || _.isNull(iid.Root()) || _.isEmpty(iid.Extension());
    };



    self.IsValidIdentifiers = function () {
        var invalid = _.find(self.Entity().Identifiers(), function (iid) {
            return _.isUndefined(iid.Extension()) || _.isNull(iid.Extension()) ||
                _.isUndefined(iid.Root()) || _.isNull(iid.Root()) || _.isEmpty(iid.Extension());
        });

        return _.isUndefined(invalid) || _.isNull(invalid);
    };
*/

    /*
    self.IsValid = ko.computed(function() {
        return !self.Entity().FirstName.hasError() && !self.Entity().LastName.hasError() && !self.Entity().City.hasError() && !self.Entity().StreetAddress.hasError();
    });
    */

};

SEE.viewmodel.modal.PersonInfoViewModel.inheritsFrom(SEE.viewmodel.modal.BaseModal);