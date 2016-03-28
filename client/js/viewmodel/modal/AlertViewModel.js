/// <reference path="../../lib/external/underscore/underscore.js" />
SEE.namespace("SEE.viewmodel.modal");

SEE.viewmodel.modal.AlertViewModel = function () {
    var self = this;

    this.init();
    self.Name = "AlertViewModel";
    self.UI.TemplateName("modal/Alert.html");
    self.Entity("");

    self.OnSuccess = null;

    self.LoadEntity = function (alertInfo, onsuccess) {

        if (alertInfo && alertInfo.Text && alertInfo.Title) {
        } else {
            throw "Must supply modal text and title.";
        }

        self.Entity(alertInfo);
        self.OnSuccess = onsuccess;
    };

    self.DoClose = function () {
        if (!confirm("Any changes made to this dialog will be lost. Are you sure?")) {
            return;
        }

        SEE.session.MainVM.Modal.Close();
    };
};

SEE.viewmodel.modal.AlertViewModel.inheritsFrom(SEE.viewmodel.modal.BaseModal);