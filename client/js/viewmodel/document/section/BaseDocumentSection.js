SEE.namespace("SEE.viewmodel.document.section");

SEE.viewmodel.document.section.BaseDocumentSection = function () {
};

SEE.viewmodel.document.section.BaseDocumentSection.prototype.init = function () {
    var self = this;

    self.Title = ko.observable("");
    self.XmlNode = {};
    self.UI = {};
    self.UI.CSSClass = ko.observable("");
    self.UI.LockedTemplateName = ko.observable("document/section/LockedSection.html");
    self.UI.EditTemplateName = ko.observable("");
    self.ParentPropertyName = "";
    self.LockedBy = "";
    self.LockTime = ko.observable(new Date());
    self.ParentViewModel = {};
    self.Entity = ko.observable({});

    //set this to false to indicate that validation has failed
    self.CanSave = ko.observable(true);

    //this is the message to the user in the form of a UIAlert, use null to dismiss the message
    self.Message = ko.observable(null);

    self.DoGenerateText = function() {

    };

    self.Locked = ko.observable(true);

    self.UI.TemplateName = ko.computed(function () {
        if (self.Locked()) {
            return self.UI.EditTemplateName();
        } else {
            return self.UI.LockedTemplateName();
        }
    });

    self.UpdateEntity = function (entityJS) {
        if (ko.isObservable(self.Entity)) {
            self.Entity().fromJS.call(self.Entity(), entityJS);
        }
    }

    self.OverrideLock = function () {
        bootbox.confirm("Are you sure you want to override the lock in use by " + self.LockedBy + "? Doing so will cause ALL of " + self.LockedBy + "'s unsaved changes to be lost.", function(okPressed){
            if (okPressed){
                self.ParentViewModel.LockAndDisplaySection(self, true);
            }
        });
    };

    self.HasChanges = function () {
        if (self.Entity && self.Entity() && self.Entity()._SEE_Type && self.Entity().HasChanges) {
            return self.Entity().HasChanges();
        }
    }

    self.ElapsedTime = ko.computed(function(){
        var ms = new Date() -self.LockTime();

        var secs = ms / 1000;
        ms = Math.floor(ms % 1000);

        var minutes = secs / 60;
        secs = Math.floor(secs % 60);

        var hours = minutes / 60;
        minutes = Math.floor(minutes % 60);
        hours = Math.floor(hours % 24);

        return hours + " hours, " + minutes + " minutes and " + secs + " seconds";
    });
};


SEE.viewmodel.document.section.BaseDocumentSection.prototype.Import = function (document, sourceId, sourceTitle) {
    if (document[this.ParentPropertyName] && document[this.ParentPropertyName].FreeNarrative) {
        this.ImportSection(document[this.ParentPropertyName], sourceId, sourceTitle);
    }
};

SEE.viewmodel.document.section.BaseDocumentSection.prototype.ImportSection = function (section, sourceId, sourceTitle) {
    var nar = "";
    if (ko.isObservable(section)) {
        nar = section.FreeNarrative();
    } else {
        nar = section.FreeNarrative;
    }

    if (this.Entity() && this.Entity().FreeNarrative && ko.isObservable(this.Entity().FreeNarrative)) {
        nar = SEE.util.narrativeToHTML("<text>" + nar + "</text>");
        this.Entity().FreeNarrative(this.Entity().FreeNarrative() + "<br/>" + nar);
    } else if (this.FreeNarrative && ko.isObservable(this.FreeNarrative)) {
        nar = SEE.util.narrativeToHTML("<text>" + nar + "</text>");
        this.FreeNarrative(this.FreeNarrative() + "<br/>" + nar);
    }

    SEE.util.RecordImportEvent(sourceId, sourceTitle, this.ParentViewModel.Document, this);
};

SEE.viewmodel.document.section.BaseDocumentSection.prototype.LoadEntity = function (document) {
    this.Entity().fromJS.call(this.Entity(), document[this.ParentPropertyName]);
};


SEE.viewmodel.document.section.BaseDocumentSection.prototype.SaveEntity = function (document) {
    if (this.Entity && this.Entity() && this.Entity()._SEE_Type) {
        if (ko.isObservable(this.Entity().GeneratedNarrative) && ko.isObservable(this.Entity().FreeNarrative) && ko.isObservable(this.Entity().TransformedNarrative)) {
            var nar = "<text>" + this.Entity().GeneratedNarrative().replace(/<br>/gi, "<br/>") + "<br/>" + this.Entity().FreeNarrative().replace(/<br>/gi, "<br/>") + "</text>";
            nar = nar.replace(/&nbsp;/gi, " ");
            this.Entity().TransformedNarrative(SEE.util.narrativeToCDAHTML(nar));
        }
        document[this.ParentPropertyName] = this.Entity().toJS();
        this.Entity().Commit();
    }
};
