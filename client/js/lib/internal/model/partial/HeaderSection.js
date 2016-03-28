/// <reference path="../../../external/underscore/underscore.js" />
/// <reference path="../../utils/uuid.js" />
SEE.namespace("SEE.model.dto");
SEE.model.dto.HeaderSection.prototype.init = function () {
    SEE.model.BaseModel.prototype.init.call(this);

    var self = this;
    self.Map = self.Map || {};
    self.Map.Authors = {
        create: function (options) {
            var author = new SEE.model.dto.PersonInfo();
            author.fromJS(options.data);
            return author;
        }
    };

    self.Map.OtherMembersOfCareTeam = {
        create: function (options) {
            var p = new SEE.model.dto.PersonInfo();
            p.fromJS(options.data);
            return p;
        }
    };

    self.Map.Patient = {
        update: function (options) {
            var p = new SEE.model.dto.Patient();
            p.fromJS(options.data);
            return p;
        }
    };

    self.Map.Custodian = {
        update: function (options) {
            var o = new SEE.model.dto.OrganizationInfo();
            o.fromJS(options.data);
            return o;
        }
    };

    self.Map.ClinicianToContactWithQuestions = {
        update: function (options) {
            var o = new SEE.model.dto.PersonInfo();
            o.fromJS(options.data);
            return o;
        }
    };

    self.Map.NextOfKin = {
        update: function (options) {
            var o = new SEE.model.dto.PersonInfo();
            o.fromJS(options.data);
            return o;
        }
    };

    self.Map.PrimaryCareGiverAtHome = {
        update: function (options) {
            var o = new SEE.model.dto.PersonInfo();
            o.fromJS(options.data);
            return o;
        }
    };

    self.Map.Guardian = {
        update: function (options) {
            var o = new SEE.model.dto.PersonInfo();
            o.fromJS(options.data);
            return o;
        }
    };

    self.Map.PrincipleCarePhysician = {
        update: function (options) {
            var o = new SEE.model.dto.PersonInfo();
            o.fromJS(options.data);
            return o;
        }
    };

    self.Map.CarePlanManager = {
        update: function (options) {
            var o = new SEE.model.dto.PersonInfo();
            o.fromJS(options.data);
            return o;
        }
    };

    self.Map.PrincipleHealthCareProvider = {
        update: function (options) {
            var o = new SEE.model.dto.PersonInfo();
            o.fromJS(options.data);
            return o;
        }
    };

    self.Map.PrincipleCareGiver = {
        update: function (options) {
            var o = new SEE.model.dto.PersonInfo();
            o.fromJS(options.data);
            return o;
        }
    };


};

