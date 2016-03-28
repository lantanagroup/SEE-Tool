/// <reference path="../../../external/underscore/underscore.js" />
/// <reference path="../../utils/uuid.js" />
SEE.namespace("SEE.model.dto");
SEE.model.dto.PersonInfo.prototype.init = function () {
    SEE.model.BaseModel.prototype.init.call(this);

    var self = this;
    self.Map = self.Map || {"ignore": ["FullName", "IsEmpty"]};
    self.Map.Identifiers = {
        create: function (options) {
            var iid = new SEE.model.dto.InstanceIdentifier();
            iid.fromJS(options.data);
            return iid;
        }
    };

    self._oid_ = uuid.v4();
    self.FirstName.extend({ required: true });
    self.LastName.extend({ required: true });
    self.StreetAddress.extend({ required: true });
    self.City.extend({ required: true });

    self.FullName = ko.computed(function () {

        var name = "";

        if (self.FirstName() && self.FirstName().length) {
            name += self.FirstName();
        }

        if (self.LastName() && self.LastName().length) {
            if (name.length) {
                name += " ";
            }
            name += self.LastName();
        }
        return name;
    });

    self.IsEmpty = ko.computed(function(){
        if (self.FirstName() && self.FirstName().length && self.LastName() && self.LastName().length) {
            return false;
        }

        return true;
    });

    //this is here (rather than being delegated to instance identifiers because, for some reason, knockout has not computed the InstanceIdentifier's hasError
     var identifiersHaveErrors = function () {
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
                var invalid = checkstring(SEE.util.UnwrapObservable(i.Root)) || checkstring(SEE.util.UnwrapObservable(i.Extension));
                return invalid;
            }
        });

        return !_.isUndefined(invalidId) ;
    };


    /*
    self.InvalidIdentifier = ko.computed({
        read: function () {
            return self.identifiersHaveErrors();
        },
        write: function () {
            return self.identifiersHaveErrors();
        }
    });
    */

    var validate = function () {
        return self.FirstName.hasError() || self.LastName.hasError() || self.StreetAddress.hasError() ||self.City.hasError() || identifiersHaveErrors();
    };

    
    self.hasError = ko.computed({
        read: function () {
            return validate();
        },
        write: function () {
            return validate();
        }
    });

    /*
    self.identifiersHaveErrors = ko.computed(function(){
        return _.some(self.Identifiers(), function(item){

            return item.hasError();


        });
    });
*/


    self.Clear = function () {
        self.FirstName("");
        self.LastName("");
        self.StreetAddress("");
        self.City("");
        self.State("");
        self.ZipCode("");
        self.Country("");
        self.Phone("");
        self.AltPhone("");
        self.Pager("");
        self.Email("");
        self.Suffix("");
        self.Identifiers([]);

        self.Identifiers.valueHasMutated();
    };

    self.LastName.subscribe(self.hasError);
    self.FirstName.subscribe(self.hasError);
    self.StreetAddress.subscribe(self.hasError);
    self.City.subscribe(self.hasError);
    self.Identifiers.subscribe(self.hasError);

};

SEE.model.dto.PersonInfo.prototype.Clone = function (source) {
    this.FirstName(SEE.util.UnwrapObservable(source.FirstName));
    this.LastName(SEE.util.UnwrapObservable(source.LastName));
    this.StreetAddress(SEE.util.UnwrapObservable(source.StreetAddress));
    this.City(SEE.util.UnwrapObservable(source.City));
    this.State(SEE.util.UnwrapObservable(source.State));
    this.ZipCode(SEE.util.UnwrapObservable(source.ZipCode));
    this.Country(SEE.util.UnwrapObservable(source.Country));
    this.Phone(SEE.util.UnwrapObservable(source.Phone));
    this.AltPhone(SEE.util.UnwrapObservable(source.AltPhone));
    this.Pager(SEE.util.UnwrapObservable(source.Pager));
    this.Email(SEE.util.UnwrapObservable(source.Email));
    this.Suffix(SEE.util.UnwrapObservable(source.Suffix));
    this.Identifiers([]);
    _.each(SEE.util.UnwrapObservable(source.Identifiers), function (iid) {
        var newiid = new SEE.model.dto.InstanceIdentifier();
        newiid.Root(SEE.util.UnwrapObservable(iid.Root));
        newiid.Extension(SEE.util.UnwrapObservable(iid.Extension));
        this.Identifiers.push(newiid);
    }, this);

    this.Identifiers.valueHasMutated();
};


