/// <reference path="../../../external/underscore/underscore.js" />
SEE.namespace("SEE.model.dto");
SEE.model.dto.ImmunizationSection.prototype.init = function () {
    SEE.model.BaseModel.prototype.init.call(this);

    var self = this;
    self.Map = self.Map || {};
    self.Map.Immunizations = {
        create: function (options) {
            var item = new SEE.model.dto.ImmunizationEntry();
            item.fromJS(options.data);
            return item;
        }
    };
};