SEE.namespace("SEE.viewmodel.document.section");

SEE.viewmodel.document.section.ReviewSectionViewModel = function () {
    SEE.viewmodel.document.section.BaseDocumentSection.prototype.init.call(this);

    var self = this;

    self.Title("Review");
    self.UI.EditTemplateName("document/section/Review.html");
    self.UI.LockedTemplateName("document/section/Review.html");
    self.ParentViewModel = ko.observable({});
    self.Locks = ko.observableArray([]);
    self.DocumentToNavigateTo = ko.observable({});

    self.Text = ko.computed(function () {
        return "Review";
    }, self);

    self.Print = function () {
        id = "ReviewFrame";
        var iframe = document.frames ? document.frames[id] : document.getElementById(id);
        var ifWin = iframe.contentWindow || iframe;
        ifWin.focus();
        ifWin.printPage();
        return false;
    };
    
    self.SaveEntity = function (document) {
        return;
    };

    self.HasChanges = function () {
        return false;
    };

    self.IsFinal = ko.computed(function () {
        if (self.ParentViewModel() && self.ParentViewModel().DocumentStatus) {
            return self.ParentViewModel().DocumentStatus() === SEE.enum.DocumentStatusCode.FINAL || self.ParentViewModel().DocumentStatus() === SEE.enum.DocumentStatusCode.SENT;
        } else {
            return false;
        }
    });

    self.OnAfterRender = function () {
        SEE.service.DocumentService.GetAllLocksForDocument(self.ParentViewModel().Document, function (locks) {
            _.each(locks, function (l) {
                self.Locks().push({
                    LockedBy: l.LockedBy.FirstName + " " + l.LockedBy.LastName,
                    LockTime: SEE.util.GetFormattedDate(new Date(l.LockTime), true),
                    SectionTitle: l.SectionTitle
                });
            });
            self.Locks.valueHasMutated();
        });
    };

    self.DoDocumentClick = function (data) {
        if (data.EventDirection === SEE.enum.EventDirectionCode.OUT) {
            SEE.ViewNavigator.NavigateTo(SEE.enum.View.DOCUMENT, { id: data.TargetDocumentId });
        } else {
            SEE.ViewNavigator.NavigateTo(SEE.enum.View.DOCUMENT, { id: data.SourceDocumentId });
        }
    };

    self.ExportEvents = ko.computed(function () {
        var events = [], sources = {};
        if (self.ParentViewModel() && self.ParentViewModel().Document) {
            _.each(self.ParentViewModel().Document.DocumentInfo.History.HistoricalEvents, function (ev) {
                if (ev.EventDirection === SEE.enum.EventDirectionCode.OUT) {
                    if (!sources[ev.TargetDocumentId]) {
                        sources[ev.TargetDocumentId] = true;
                        events.push(ev);
                    }
                }
            });
        }        
        return events;
    });

    self.ImportEvents = ko.computed(function () {
        var eventInfo = {}, events = [];

        if (self.ParentViewModel() && self.ParentViewModel().Document) {
            _.each(self.ParentViewModel().Document.DocumentInfo.History.HistoricalEvents, function (ev) {
                if (ev.EventDirection === SEE.enum.EventDirectionCode.IN) {
                    if (eventInfo[ev.SourceDocumentId]) {
                        eventInfo[ev.SourceDocumentId]["Sections"] = eventInfo[ev.SourceDocumentId]["Sections"] + ", " + ev.SectionName;
                    } else {
                        eventInfo[ev.SourceDocumentId] = {};
                        eventInfo[ev.SourceDocumentId]["DocumentTitle"] = "Long Term Care Summary";
                        eventInfo[ev.SourceDocumentId]["Sections"] = ev.SectionName;
                    }                    
                }
            });
        }
        
        for (p in eventInfo) {
            if (eventInfo[p].Sections.length > 0) {
                events.push({SourceDocumentId: p, DocumentTitle: eventInfo[p].DocumentTitle, Sections : "(" + eventInfo[p].Sections + ")"});
            }
        }

        return events;
    });


    self.CreateNewDocument = function () {
        var DoImport = function (newVM) {
            var counter = 30;
            var SpinWait = function () {
                if (counter === 0) {
                    //waiting too long, error out
                    var newAlert = new SEE.model.UIAlert();
                    newAlert.SetDisplay("Import", "The import has failed to execute.", SEE.model.AlertType.ERROR);
                    self.Message(newAlert);


                    //SEE.session.MainVM.DisplayAlert("Document", "The import has failed to execute.", SEE.model.AlertType.ERROR);
                    return;
                }
                if (newVM.IsLoading()) {
                    SEE.util.log("Document is not finished loading, waiting...");
                    counter = counter - 1;
                    window.setTimeout(SpinWait, 500);
                    return;
                }
                SEE.util.log("Document is finished loading, importing");
                //call the import all of the new document
                newVM.DoImportAllSections(self.ParentViewModel().Document);
            };
            SpinWait();
        };
        //create new document
        var newVM = SEE.ViewNavigator.NavigateTo(SEE.enum.View.DOCUMENT);
        DoImport(newVM);
    };
};

SEE.viewmodel.document.section.ReviewSectionViewModel.inheritsFrom(SEE.viewmodel.document.section.BaseDocumentSection);