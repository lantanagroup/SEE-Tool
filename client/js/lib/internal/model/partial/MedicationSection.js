/// <reference path="../../../external/underscore/underscore.js" />
SEE.namespace("SEE.model.dto");
SEE.model.dto.MedicationSection.prototype.init = function () {
    SEE.model.BaseModel.prototype.init.call(this);

    var self = this;
    self.Map = self.Map || {};
    self.Map.Medications = {
        create: function (options) {
            var entry = new SEE.model.dto.MedicationEntry();
            entry.fromJS(options.data);
            return entry;
        }
    };

    self.Map.MedicationExclusions = {
        create: function (options) {
            var entry = new SEE.model.dto.MedicationExclusionEntry();
            entry.fromJS(options.data);
            return entry;
        }
    };

};