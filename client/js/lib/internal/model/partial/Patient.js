/// <reference path="../../../external/underscore/underscore.js" />
/// <reference path="../../utils/uuid.js" />
SEE.namespace("SEE.model.dto");
SEE.model.dto.Patient.prototype.init = function () {
    SEE.model.BaseModel.prototype.init.call(this);

    var self = this;
    self.Map = self.Map || {};
    self.Map.Identifiers = {
        create: function (options) {
            var iid = new SEE.model.dto.InstanceIdentifier();
            iid.fromJS(options.data);
            return iid;
        }        
    };
    self.Map.ignore = ["hasError"];

    self.BirthTime.extend({ required: true });
    self.GenderCode.extend({ required: true });

    self._oid_ = uuid.v4();

    var validate = function () {
        return self.BirthTime.hasError() || self.GenderCode.hasError() || self.PersonInfo.hasError(); //, bug here it's not firing correctly
    };

    self.hasError = ko.computed(
        {
            read: validate,
            write: validate
        });

    self.PersonInfo.hasError.subscribe(self.hasError);
    self.BirthTime.subscribe(self.hasError);
    self.GenderCode.subscribe(self.hasError);

    
};

SEE.model.dto.Patient.prototype.Clone = function (source) {
    this.GenderCode(SEE.util.UnwrapObservable(source.GenderCode));
    this.RaceCode(SEE.util.UnwrapObservable(source.RaceCode));
    this.EthnicityCode(SEE.util.UnwrapObservable(source.EthnicityCode));
    this.PrimaryLanguageCode(SEE.util.UnwrapObservable(source.PrimaryLanguageCode));
    this.OtherLanguageCode(SEE.util.UnwrapObservable(source.OtherLanguageCode));
    this.MaritalStatusCode(SEE.util.UnwrapObservable(source.MaritalStatusCode));
    this.ReligionCode(SEE.util.UnwrapObservable(source.ReligionCode));
    this.BirthTime(SEE.util.UnwrapObservable(source.BirthTime));
    this.PersonInfo.Clone(SEE.util.UnwrapObservable(source.PersonInfo));
};
