SEE.namespace("SEE");

SEE.session = new (function () {
    var self = this;

    self.MainVM = new SEE.viewmodel.MainViewModel();
    self.ViewModelDispatch = new SEE.viewmodel.ViewModelDispatch();
    self.User = null;
    self.Organization = null;

    self.UserFullName = function () {
        if (_.isUndefined(SEE.session) || _.isUndefined(SEE.session.User)) {
            return;
        }

        if (SEE.session.User.PersonInfo.FirstName && SEE.session.User.PersonInfo.LastName) {
            return SEE.session.User.PersonInfo.FirstName + " " + SEE.session.User.PersonInfo.LastName;
        } else {
            return SEE.session.User.UserName;
        }
    };

    self.UserName = function () {
        if (_.isUndefined(SEE.session) || _.isUndefined(SEE.session.User)) {
            return;
        }

        return SEE.session.User.UserName;
    };

    self.SetUser = function (user) {
        window.sessionStorage.setItem("SEE.User", JSON.stringify(user));
        //window.sessionStorage.setItem("SEE.Username", username);
        SEE.session.User = user;
        //SEE.session.Username = username;
    };

    if (!_.isUndefined(window.sessionStorage)) {
        var UserString = window.sessionStorage.getItem("SEE.User");
        if (!_.isUndefined(UserString) && !_.isNull(UserString) && UserString != "undefined") {
            self.User = JSON.parse(UserString);
        }
    }

    self.DefaultUserName = !_.isUndefined(window.sessionStorage) ? window.sessionStorage.getItem("SEE.DefaultUserName") : "";

    if (_.isNull(self.DefaultUserName) || (self.DefaultUserName === "")) {
        self.DefaultUserName = "john.baker";
    }

    self.SectionLockHistory = [];
    self.SectionLocks = ko.observable({});

    self.SetSectionLock = function (document, sectionName, lock) {
        if (sectionName === 'DocumentInfo.Header') {
            sectionName = 'DocumentInfo';
        }
        var lockid = document._id + "_" + sectionName;
        self.SectionLockHistory.push("Adding lock for '" + sectionName + "', lock='" + lock + "'");
        self.SectionLocks()[lockid] = lock;
        self.SectionLocks.valueHasMutated();
    };

    self.GetSectionLock = function (document, sectionName) {
        if (sectionName === 'DocumentInfo.Header') {
            sectionName = 'DocumentInfo';
        }
        var lockid = document._id + "_" + sectionName;
        return self.SectionLocks()[lockid];
    };

    self.ClearSectionLock = function (document, sectionName) {
        var lockid;
        if (!document || !document._id) {
            return;
        }
        lockid = document._id + "_" + sectionName;
        if (self.IsSectionLockedLocally(document, sectionName)) {
            self.SectionLockHistory.push("Clearing lock for '" + sectionName + "', lock='" + self.SectionLocks()[lockid].Lock + "'");
            delete self.SectionLocks()[lockid];
            self.SectionLocks.valueHasMutated();
        } else {
            self.SectionLockHistory.push("Lock release requested but no local lock existed for '" + sectionName + "'");
        }
    };

    self.IsSectionLockedLocally = function (document, sectionName) {
        var lockid;

        if (!document || !document._id) { //this is a new document, grant lock
            return true;
        }
        lockid = document._id + "_" + sectionName;
        return !_.isUndefined(self.SectionLocks()[lockid]);
    };
});