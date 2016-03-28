/// <reference path="../../../external/underscore/underscore.js" />
/// <reference path="../../utils/uuid.js" />
SEE.namespace("SEE.model.dto");
SEE.model.dto.OrganizationInfo.prototype.init = function () {
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
    self._oid_ = uuid.v4();
    self.Name.extend({ required: true });
    self.StreetAddress.extend({ required: true });
    self.City.extend({ required: true });

    self.IsEmpty = ko.computed(function(){
        if (self.Name() && self.Name().length) {
            return false;
        }

        return true;
    });

    self.identifiersHasError = function () {
        var checkstring = function (v) {
            if (_.isNull(v) || _.isUndefined(v)) {
                return true;
            }
            if (_.isString(v) && _.isEmpty(v)) {
                return true;
            }
            if (!_.isString(v)) {
                return true;
            }

            return false;
        }

        var invalidId = _.find(self.Identifiers(), function (i) {
            if (i.hasError) {
                return i.hasError();
            } else {
                return checkstring(SEE.util.UnwrapObservable(i.Root)) || checkstring(SEE.util.UnwrapObservable(i.Extension));
            }
        });

        return !_.isUndefined(invalidId);
    };

//only identifiers are truly required, but we'll include name and address
    self.hasError = ko.computed(function () {
        return self.Name.hasError() || self.StreetAddress.hasError() || self.City.hasError() || self.identifiersHasError();
    });
};

SEE.model.dto.OrganizationInfo.prototype.Clone = function (source) {
    this.Name(SEE.util.UnwrapObservable(source.Name));
    this.StreetAddress(SEE.util.UnwrapObservable(source.StreetAddress));
    this.City(SEE.util.UnwrapObservable(source.City));
    this.State(SEE.util.UnwrapObservable(source.State));
    this.ZipCode(SEE.util.UnwrapObservable(source.ZipCode));
    this.Phone(SEE.util.UnwrapObservable(source.Phone));
    this.AltPhone(SEE.util.UnwrapObservable(source.AltPhone));
    this.Email(SEE.util.UnwrapObservable(source.Email));
    this.Identifiers([]);

    _.each(SEE.util.UnwrapObservable(source.Identifiers), function (iid) {
        var newiid = new SEE.model.dto.InstanceIdentifier();
        //newiid.fromJS.call(newiid, (iid.toJS ? iid.toJS() : iid));
        newiid.Root(SEE.util.UnwrapObservable(iid.Root));
        newiid.Extension(SEE.util.UnwrapObservable(iid.Extension));
        this.Identifiers.push(newiid);
    }, this);
};

