/// <reference path="../../../external/underscore/underscore.js" />
SEE.namespace("SEE.model.dto");
SEE.model.dto.ProblemSectionProblem.prototype.init = function () {
    SEE.model.BaseModel.prototype.init.call(this);

    var self = this, highRiskConditions ;

    highRiskConditions = ["homicidal ideation", "suicidal ideation", "psychosis", "severe depression", "bipolar", "chf", "atrial fibrillation", "pna", "copd", "esrd", "depression", "substance abuse"];

    this.IsActive = ko.computed(function () {
        var notResolved = _.isNull(self.ResolutionDate()) || _.isUndefined(self.ResolutionDate());
        if (_.isString(self.ResolutionDate())) {
            notResolved = notResolved || _.isEmpty(self.ResolutionDate());
        }

        return notResolved;
    });

    this.FullName = ko.computed(function () {
        var s = self.Name();

        if (!_.isUndefined(self.DateOfOnset()) && self.DateOfOnset() != null && (self.DateOfOnset().length > 0)) {
            s += " (" + SEE.util.GetFormattedDate(self.DateOfOnset()) + ")";
        }

        return s;
    });

    this.IsHighRisk = ko.computed(function () {

        if (!_.isUndefined(self.Name())) {
            var lname = self.Name().toLowerCase();
            return _.any(highRiskConditions, function (n) {
                return n === lname;
            });
        }

        return false;
    });

    self.Map = self.Map || {};
    self.Map.Diagnoser = {
        create: function (options) {
            var o = new SEE.model.dto.PersonInfo();
            o.fromJS(options.data);
            return o;
        }
    };
};
