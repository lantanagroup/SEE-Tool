/// <reference path="../../../external/underscore/underscore.js" />
SEE.namespace("SEE.model.dto");
SEE.model.dto.ProcedureSection.prototype.init = function () {
    SEE.model.BaseModel.prototype.init.call(this);

    var self = this;
    self.Map = self.Map || {};
    self.Map.ProcedureOrders = {
        create: function (options) {
            var procedureOrderEntry = new SEE.model.dto.ProcedureOrderEntry();
            procedureOrderEntry.fromJS(options.data);
            return procedureOrderEntry;
        }
    };

    self.Map.CommonTreatments = {
        create: function (options) {
            var e = new SEE.model.dto.TreatmentEntry();
            e.fromJS(options.data);
            return e;
        }
    };

    self.Map.SpecializedTreatments = {
        create: function (options) {
            var e = new SEE.model.dto.TreatmentEntry();
            e.fromJS(options.data);
            return e;
        }
    };

    self.Map.OtherTreatments = {
        create: function (options) {
            var e = new SEE.model.dto.TreatmentEntry();
            e.fromJS(options.data);
            return e;
        }
    };
};