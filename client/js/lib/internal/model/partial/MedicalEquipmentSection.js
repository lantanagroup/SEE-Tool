/// <reference path="../../../external/underscore/underscore.js" />
SEE.namespace("SEE.model.dto");
SEE.model.dto.MedicalEquipmentSection.prototype.init = function () {
    SEE.model.BaseModel.prototype.init.call(this);

    var self = this;
    self.Map = self.Map || {};
    self.Map.MedicalEquipment = {
        create: function (options) {
            var entry = new SEE.model.dto.MedicalEquipmentEntry();
            entry.fromJS(options.data);
            return entry;
        }
    };

    self.Map.Supplies = {
        create: function (options) {
            var entry = new SEE.model.dto.MedicalSupplyEntry();
            entry.fromJS(options.data);
            return entry;
        }
    };

};