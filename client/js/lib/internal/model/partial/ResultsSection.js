SEE.namespace("SEE.model.dto");

SEE.model.dto.ResultsSection.prototype.init = function () {
    SEE.model.BaseModel.prototype.init.call(this);

    var self = this;

    self.IsSelected = ko.observable(false);

    self.Map = self.Map || {};
    self.Map.LabResults = {
        create: function (options) {
            var item = new SEE.model.dto.LabResult();
            item.fromJS(options.data);
            return item;
        }
    };

    self.Map.OtherLabResults = {
        create: function (options) {
            var item = new SEE.model.dto.LabResult();
            item.fromJS(options.data);
            return item;
        }
    };
}