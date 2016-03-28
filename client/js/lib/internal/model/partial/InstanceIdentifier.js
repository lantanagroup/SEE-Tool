/// <reference path="../../../external/underscore/underscore.js" />
/// <reference path="../../utils/uuid.js" />
SEE.namespace("SEE.model.dto");
SEE.model.dto.InstanceIdentifier.prototype.init = function () {
    SEE.model.BaseModel.prototype.init.call(this);

    var self = this;

    self._oid_ = uuid.v4();

    self.Root.extend({ required: true });
    self.Extension.extend({ required: true });

    var validate = function () {
        return self.Root.hasError() || self.Extension.hasError();
    };

    self.hasError = ko.computed({
        read: validate,
        write: validate
    });

};

