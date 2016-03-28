SEE.namespace("SEE.model.dto");

SEE.model.dto.SocialHistorySection.prototype.init = function () {
    SEE.model.BaseModel.prototype.init.call(this);

    var self = this;

    self.SmokingStatusName = ko.computed(function () {
        var found = _.find(SEE.model.SmokingStatusList, function (item) {
            return (item.Code == self.Smoking())
        });

        if (found)
            return found.DisplayName;

        return "";
    });
}