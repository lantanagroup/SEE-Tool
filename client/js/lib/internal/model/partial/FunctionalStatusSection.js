/// <reference path="../../../external/underscore/underscore.js" />
SEE.namespace("SEE.model.dto");
SEE.model.dto.FunctionalStatusSection.prototype.init = function () {
    SEE.model.BaseModel.prototype.init.call(this);

    var self = this;
    self.Map = self.Map || {};
    self.Map.DailyLivings = {
        create: function (options) {
            var item = new SEE.model.dto.FunctionalStatusEntry();
            item.fromJS(options.data);
            return item;
        }
    };
    self.Map.Capabilities = {
        create: function (options) {
            var item = new SEE.model.dto.FunctionalStatusEntry();
            item.fromJS(options.data);
            return item;
        }
    };
    self.Map.Cognitions = {
        create: function (options) {
            var item = new SEE.model.dto.FunctionalStatusEntry();
            item.fromJS(options.data);
            return item;
        }
    };
    self.Map.SpecialAlerts = {
        create: function (options) {
            var item = new SEE.model.dto.FunctionalStatusEntry();
            item.fromJS(options.data);
            return item;
        }
    };
    self.Map.PainScales = {
        create: function (options) {
            var item = new SEE.model.dto.FunctionalStatusPainScaleEntry();
            item.fromJS(options.data);
            return item;
        }
    };

};