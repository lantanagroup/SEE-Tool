SEE.namespace("SEE.util");
SEE.util.RecordImportEvent = function (sourceId, sourceTitle, targetDocument, section) {
    var event = new SEE.model.dto.HistoryEvent();
    event.Author = SEE.session.User;
    event.Event = "Import";
    event.SectionName = section.Title();
    event.SourceDocumentId = sourceId;
    event.SourceDocumentTitle = sourceTitle;
    event.EventTime = new Date();
    event.EventDirection = SEE.enum.EventDirectionCode.IN;
    SEE.util.AttachEventToDocument(targetDocument, event);
};

SEE.util.AttachEventToDocument = function (targetDocument, event) {
    targetDocument.DocumentInfo.History.NewEvents.push(event);
};


