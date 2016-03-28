/// <reference path="../../../external/underscore/underscore.js" />
/// <reference path="../../utils/uuid.js" />
SEE.namespace("SEE.model.dto");
SEE.model.dto.PastIllnessSection.prototype.init = function () {
    SEE.model.BaseModel.prototype.init.call(this);

    var self = this;
    self.Map = self.Map || {};
    self.Map.PastIllnesses = {
        create: function (options) {
            var o = new SEE.model.dto.PastIllnessEntry();
            o.fromJS(options.data);
            return o;
        }
    };

    self._oid_ = uuid.v4();
};

