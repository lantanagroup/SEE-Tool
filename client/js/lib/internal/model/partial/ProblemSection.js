/// <reference path="../../../external/underscore/underscore.js" />
SEE.namespace("SEE.model.dto");
SEE.model.dto.ProblemSection.prototype.init = function () {
    SEE.model.BaseModel.prototype.init.call(this);

    var self = this;

    self.Title = "PROBLEMS";

    self.Map = self.Map || {};
    self.Map.Problems = {
        create: function (options) {
            var problem = new SEE.model.dto.ProblemSectionProblem();
            problem.fromJS(options.data);
            return problem;
        }
    };
};
