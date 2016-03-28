/// <reference path="../../../external/underscore/underscore.js" />
SEE.namespace("SEE.model.dto");
SEE.model.dto.DischargeDiagnosisEntry.prototype.init = function () {
    SEE.model.BaseModel.prototype.init.call(this);

    var self = this ;
    self.Map = self.Map || {};
    self.Map.Diagnoser = {
        create: function (options) {
            var o = new SEE.model.dto.PersonInfo();
            o.fromJS(options.data);
            return o;
        }
    };

};
