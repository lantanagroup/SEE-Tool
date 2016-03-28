/// <reference path="../../../external/underscore/underscore.js" />
SEE.namespace("SEE.model.dto");
SEE.model.dto.DischargeDiagnosisSection.prototype.init = function () {
    SEE.model.BaseModel.prototype.init.call(this);

    var self = this;
    self.Map = self.Map || {};
    self.Map.DischargeDiagnosis = {
        create: function (options) {
            var dischargeDiagnosis = new SEE.model.dto.DischargeDiagnosisEntry();
            dischargeDiagnosis.fromJS(options.data);
            return dischargeDiagnosis;
        }
    };
};