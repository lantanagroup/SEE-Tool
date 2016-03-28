SEE.namespace("SEE.viewmodel.modal");

SEE.viewmodel.modal.BaseModal = function () {
};

SEE.viewmodel.modal.BaseModal.inheritsFrom(SEE.model.BaseModel);

SEE.viewmodel.modal.BaseModal.prototype.init = function () {
    this.UI = {};
    this.UI.TemplateName = ko.observable("");
    this.Name = "BaseModal";
    this.Title = ko.observable("");
    this.Entity = ko.observable({});
    this.ValidateEntity = function () {
        var isValid = true;

        if (this.OnValidate) {
            isValid = this.OnValidate();
        }

        return isValid;

    };
};

