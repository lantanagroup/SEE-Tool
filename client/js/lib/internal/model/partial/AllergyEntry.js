/// <reference path="../../../external/underscore/underscore.js" />
SEE.namespace("SEE.model.dto");
SEE.model.dto.AllergyEntry.prototype.init = function () {
    SEE.model.BaseModel.prototype.init.call(this);

    var self = this;

    self.SeverityName = ko.computed(function () {
        var found =_.find(SEE.model.SeverityList, function(item){
            return (item.Code == self.Severity())
        });

        if (found)
            return found.DisplayName;

        return "";
    });




};
