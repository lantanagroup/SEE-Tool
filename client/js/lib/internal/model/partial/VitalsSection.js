/// <reference path="../../../external/underscore/underscore.js" />
SEE.namespace("SEE.model.dto");
SEE.model.dto.VitalsSection.prototype.init = function () {
    SEE.model.BaseModel.prototype.init.call(this);

    var self = this;
    self.Map = self.Map || {};
    self.Map.Vitals = {
        create: function (options) {
            var item = new SEE.model.dto.VitalSignEntry();
            item.fromJS(options.data);
            return item;
        }
    };


};