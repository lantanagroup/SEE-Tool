/// <reference path="../../../external/underscore/underscore.js" />
/// <reference path="../../utils/uuid.js" />
SEE.namespace("SEE.model.dto");
SEE.model.dto.PlanOfCareSection.prototype.init = function () {
    SEE.model.BaseModel.prototype.init.call(this);

    var self = this;
    self.Map = self.Map || {};
    self.Map.Instructions = {
        update: function (options) {
            var o = new SEE.model.dto.InstructionsAndFollowupPlans();
            o.fromJS(options.data);
            return o;
        }
    };
    self.Map.HomecareSpecificIssues = {
        update: function (options) {
            var o = new SEE.model.dto.HomecareSpecificIssues();
            o.fromJS(options.data);
            return o;
        }
    };

    self.Map.ShortTermGoals = {
        create: function (options) {
            var item = new SEE.model.dto.Goal();
            item.fromJS(options.data);
            return item;
        }
    };

    self.Map.ProblemSpecificGoals = {
        create: function (options) {
            var item = new SEE.model.dto.ProblemSpecificGoal();
            item.fromJS(options.data);
            return item;
        }
    };

    self.Map.LongTermGoals = {
        create: function (options) {
            var item = new SEE.model.dto.Goal();
            item.fromJS(options.data);
            return item;
        }
    };

    self.Map.GoalWeight = {
        create: function (options) {
            var item = new SEE.model.dto.Goal();
            item.fromJS(options.data);
            return item;
        }
    };
    self._oid_ = uuid.v4();
};

