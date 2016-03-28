SEE.namespace("SEE.viewmodel.document.section");

SEE.viewmodel.document.section.HistoryOfEncountersViewModel = function () {
    SEE.viewmodel.document.section.BaseDocumentSection.prototype.init.call(this);

    var self = this;

    self.Title("ENCOUNTERS");
    self.UI.EditTemplateName("document/section/HistoryOfEncountersSection.html");

    self.Entity = ko.observable(new SEE.model.dto.EncountersSection());

    var onEncountersChanged = function () {
        var hasEDVisit = self.Entity().LastEDVisit() && self.Entity().LastEDVisit() != "";
        var hasNumEDVisits = self.Entity().NumberofEDVisits() && self.Entity().NumberofEDVisits != "";

        if (!hasEDVisit && !hasNumEDVisits) {
            self.Entity().GeneratedNarrative("");
            return;
        }

        var xmlDoc = $("<root/>");

        var list = $("<ul/>")
        xmlDoc.append(list);

        if (hasEDVisit) {
            var lastEdVisitDate = $('<li/>');
            lastEdVisitDate.text('Last ED Visit: ' + SEE.util.GetFormattedDate(self.Entity().LastEDVisit()));
            list.append(lastEdVisitDate);
        }

        if (hasNumEDVisits) {
            var numberofEDVisits = $('<li/>');
            numberofEDVisits.text('Number of ED Visits in the last 12 months: ' + self.Entity().NumberofEDVisits());
            list.append(numberofEDVisits);
        }

        self.Entity().GeneratedNarrative(xmlDoc.html());
    };

    self.OnAfterRender = function () {
        self.Entity().NumberofEDVisits.subscribe(onEncountersChanged);
        self.Entity().LastEDVisit.subscribe(onEncountersChanged);
    };

    self.SaveEntity = function (document) {
        self.Entity().Author = SEE.util.convertUserToAuthor(SEE.session.User);
        //call base class
        SEE.viewmodel.document.section.BaseDocumentSection.prototype.SaveEntity.call(self, document);
    };

}

SEE.viewmodel.document.section.HistoryOfEncountersViewModel.inheritsFrom(SEE.viewmodel.document.section.BaseDocumentSection);