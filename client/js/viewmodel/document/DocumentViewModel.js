/// <reference path="../../lib/internal/enum/DocumentStatusCode.js" />
/// <reference path="../../lib/internal/utils/xml.js" />
/// <reference path="../../lib/internal/enum/enum.js" />
/// <reference path="../../lib/internal/model/DocumentSectionToEnumMap.js" />
/// <reference path="../../lib/external/underscore/underscore.js" />
SEE.namespace("SEE.viewmodel");

SEE.viewmodel.DocumentViewModel = function () {
    SEE.viewmodel.BaseViewModel.prototype.init.call(this);

    var self = this, loadSampleSections, createSection, previousSection, doParseDocument, hasLoaded, headerSection;

    self.View = "document/Document.html";
    self.Name("DocumentViewModel");
    self.Title = ko.observable("new document");

    self.Sections = ko.observableArray();
    self.IsLoading = ko.observable(true);
    self.SelectedSection = ko.observable(new SEE.viewmodel.document.section.DocumentSectionViewModel());
    self.PatientName = ko.observable("");
    self.Document = {};    
    self.DocumentStatus = ko.observable(SEE.enum.DocumentStatusCode.DRAFT);

    self.CanEdit = ko.computed(function () {
        //TODO: add permission checks
        return self.DocumentStatus() === SEE.enum.DocumentStatusCode.DRAFT;
    });

    self.OpenTabs = ko.computed(function(){
        var result = _.filter(SEE.session.MainVM.Tabs(), function (tab) {
            if (tab.ViewModel.Name() === "DocumentViewModel" && tab.ViewModel !== self && tab.ViewModel.DocumentStatus() != SEE.enum.DocumentStatusCode.DRAFT)
                return true;
        });

        return result;
    });

    self.CanFinalize = ko.computed(function () {
        //TODO: add permission checks
        return self.DocumentStatus() === SEE.enum.DocumentStatusCode.DRAFT;
    });

    self.CanSend = ko.computed(function () {
        //TODO: add permission checks
        return self.DocumentStatus() === SEE.enum.DocumentStatusCode.FINAL || self.DocumentStatus() === SEE.enum.DocumentStatusCode.SENT;
    });

    self.HasChanges = function () {
        if (self.SelectedSection().HasChanges) {
            return self.SelectedSection().HasChanges();
        }

        return false;
    };

    self.IsReviewing = ko.observable(false);

    self.IsReviewing.subscribe(function (newValue) {
        if (newValue) {
            $('#sectionDiv').removeClass('span9');
            $('#sectionDiv').addClass('span11');

            self.DisplayAlert("Note:", "You are reviewing this document.", null, SEE.model.AlertType.INFO);
        } else {
            $('#sectionDiv').removeClass('span11');
            $('#sectionDiv').addClass('span9');
        }
    });

    self.ReviewStatus = ko.computed(function () {
        if (self.IsReviewing()) {
            return "Reviewing";
        }

        return "Final";
    });

    self.ShowNavigation = ko.computed(function () {
        return !self.IsReviewing();
    });

    self.IsNewDocument = false;

    self.Message = ko.observable(null);

    self.DisplayAlert = function (title, text, html, alertType) {
        var newAlert = new SEE.model.UIAlert();

        if (html != null)
            newAlert.SetHtmlDisplay(title, html, alertType)
        else
            newAlert.SetDisplay(title, text, alertType);

        self.Message(newAlert);
    };

    self.DisplayException = function (title, text, error) {
        var newAlert = new SEE.model.UIAlert();
        newAlert.SetDisplayException(title, text, error);
        self.Message(newAlert);
    };

    self.DismissAlert = function () {
        self.Message(null);
    };

    doParseDocument = function () {
        self.DocumentStatus(self.Document.DocumentInfo.Status);

        if (!self.IsNewDocument) {
            self.PatientName(self.Document.DocumentInfo.Patient.PersonInfo.FirstName + ' ' + self.Document.DocumentInfo.Patient.PersonInfo.LastName);
        }
        else {
            self.PatientName('');
            //add author based on current user
            self.Document.DocumentInfo.Header.Authors()[0] = SEE.session.User.PersonInfo;
        }

        if (self.PatientName().trim().length > 0) {
            self.Title(self.PatientName());
        }

        headerSection = new SEE.viewmodel.document.section.DemographicSectionViewModel();
        headerSection.ParentViewModel = self;
        headerSection.LoadEntity(self.Document);
        headerSection.ParentPropertyName = 'DocumentInfo.Header';
        self.Sections.push(headerSection);        

        _.each(SEE.model.DocumentSectionToSectionCode.requiredSections(), function (mapEntry) {
            var newsection = SEE.model.DocumentSectionToSectionCode.createSectionViewModel(mapEntry);
            newsection.ParentViewModel = self;
            newsection.LoadEntity(self.Document);
            self.Sections.push(newsection);
        }, self);

        //select first item
        if (self.Sections().length > 0) {
            self.DoSelectSection(self.Sections()[0]);
        }
    };

    self.Load = function (id, callback) {
        var ds = SEE.service.DocumentService;
        if (!_.isUndefined(id)) {
            ds.RetrieveDocument(id, function (data) {
                self.Document = data;
                finishLoading(callback);
            });
        }
        else {
            self.IsNewDocument = true;
            self.Document = new SEE.model.dto.Document();
            finishLoading(callback);
        }
    };

    self.Activate = function () {
        if (self.IsReviewing()) {
            self.Review();
        };
    };

    var finishLoading = function (callback) {
        doParseDocument();

        if (self.DocumentStatus() == SEE.enum.DocumentStatusCode.FINAL || self.DocumentStatus() == SEE.enum.DocumentStatusCode.SENT) {
            self.IsReviewing(true);
        }

        if (self.IsReviewing()) {
            prepareReview(function() {
                var reviewSection = new SEE.viewmodel.document.section.ReviewSectionViewModel();
                reviewSection.ParentViewModel(self);

                self.DoSelectSection(reviewSection);
            });
        }

        if (!_.isUndefined(callback)) {
            callback();
        }

        self.IsLoading(false);
    };

    self.Update = function (success) {
        var ds = SEE.service.DocumentService;
        
        self.Document.DocumentInfo.Status = self.DocumentStatus();
        self.Document.DocumentInfo.Patient.PersonInfo.FirstName = headerSection.Entity().Patient().PersonInfo.FirstName();
        self.Document.DocumentInfo.Patient.PersonInfo.LastName = headerSection.Entity().Patient().PersonInfo.LastName();
        self.Document.DocumentInfo.DateModified = new Date();
        self.PatientName(self.Document.DocumentInfo.Patient.PersonInfo.FirstName + ' ' + self.Document.DocumentInfo.Patient.PersonInfo.LastName);

        if (self.PatientName().trim().length > 0) {
            self.Title(self.PatientName());
        }

        if (self.IsNewDocument) {            
            if (this.CanEdit()) {
                try {
                    _.each(self.Sections(), function (s) {
                        if (s.SaveEntity) {
                            s.SaveEntity(self.Document);
                        }
                    }, self);
                } catch (err) {
                    SEE.session.MainVM.DisplayException("Document", "An error occurred. The document has not been saved.", err);
                    return;
                }
            }

            self.Document.DocumentInfo.Title = "LONG TERM CARE TRANSFER SUMMARY";
            self.Document.DocumentInfo.DateCreated = SEE.util.GetFormattedDate(new Date());
            self.Document.DocumentInfo.DateModified = SEE.util.GetFormattedDate(new Date());

            ds.CreateDocument(self.Document, function (newDocument) {
                self.Document._id = newDocument._id;
                self.Document.DocumentInfo.GroupIdentifier = newDocument.DocumentInfo.GroupIdentifier;
                self.Document.DocumentInfo.Author = newDocument.DocumentInfo.Author;
                for (var p in newDocument) {
                    if (_.isUndefined(!self.Document[p])) {
                        self.Document[p] = newDocument[p];
                    }
                }

                self.IsNewDocument = false;

                if (typeof success === 'function') {
                    success();
                }

                self.DisplayAlert("Success!", "The document has been saved.", null, SEE.model.AlertType.SUCCESS);
                SEE.session.MainVM.SignalDocumentListHasChanged();
            });
        }
        else {
            if (this.CanEdit()) {
                try {
                    if (self.SelectedSection().SaveEntity) {
                        self.SelectedSection().SaveEntity(self.Document);
                    }
                } catch (err) {
                    SEE.session.MainVM.DisplayException("Document", "An error occurred. The document has not been saved.", err);
                    return;
                }
            }
            var parentPropertyName = self.SelectedSection().ParentPropertyName;
            if (self.SelectedSection() === headerSection) {
                parentPropertyName = "DocumentInfo";
            }
            ds.UpdateDocumentSection(self.Document, parentPropertyName, function (result) {
                if (result.NumberRecordsUpdated < 1) {
                    var msg = (result.Locked ?
                        "Your changes have NOT been saved. {0} {1} overrode your lock on the section.".replace("{0}", result.LockedBy.FirstName).replace("{1}", result.LockedBy.LastName)
                        : "The section has not been saved. Please try again or contact the administrator.");
                    if (result.LockedBy.FirstName === SEE.session.User.FirstName && result.LockedBy.LastName === SEE.session.User.LastName) {
                        msg = "Your changes have NOT been saved. The lock was overrode by another user or the document was finalized.";
                    }

                    bootbox.alert(msg);
                } else {
                    var msg = "The section has been saved.";

                    if (typeof success === 'function') {
                        msg = "The previous section has been saved.";
                        success();
                    }

                    self.DisplayAlert("Success!", msg, null, SEE.model.AlertType.SUCCESS);
                }
            });
        }

    }

    self.Review = function () {
        if (self.SelectedSection().HasChanges && self.SelectedSection().HasChanges()) {
            bootbox.alert("You must save changes before moving to a new section.");
            //alert("You must save changes before moving to a new section.");
            return false;
        }

        SEE.service.DocumentService.ReleaseLockedSection(self.Document, self.SelectedSection().ParentPropertyName, function (section) {
            var reviewSection = new SEE.viewmodel.document.section.ReviewSectionViewModel();
            reviewSection.ParentViewModel(self);

            prepareReview(function() {
                if (self.DoSelectSection(reviewSection)) {
                    self.IsReviewing(true);

                    /*
                    if (window.ActiveXObject) { //IE
                        var frame = document.getElementById("ReviewFrame");
                        if (frame) {
                            frame.contentWindow.location.reload();
                        }
                    }

                    if (self.SelectedSection()) {
                        self.SelectedSection().UI.CSSClass("");
                    }
                    */
                }
            })
        });
    };

    var prepareReview = function (callback) {
        var displayCdaXml = function () {
            var transformer = new SEE.util.xml.transformer("resources/stylesheet/CDA.xsl");
            var parsedXml = SEE.util.xml.ParseXml(self.Document.CdaXmlDocument.Xml);
            var transformed = transformer.execute(parsedXml, self.Document.CdaXmlDocument.Xml);

            if (window.ActiveXObject) { //IE
                SEE.session.MainVM.EnqueueIframeBody(transformed);
            }
            else if (document.implementation && document.implementation.createDocument) {  //chrome and FF
                SEE.session.MainVM.EnqueueIframeBody(transformed);
            }
        };

        var ds = SEE.service.DocumentService;
        self.Document.DocumentInfo.Header.LegalAuthenticator = SEE.session.User.PersonInfo;

        if (self.Document.DocumentInfo.Status === SEE.enum.DocumentStatusCode.DRAFT) {
            ds.GenerateCdaXml(self.Document, function (result) {
                self.Document.CdaXmlDocument.Xml = result.CdaXmlDocument.Xml;
                displayCdaXml();
                callback();
            });
        } else {
            displayCdaXml();
            callback();
        }
    };

    self.Finalize = function () {
        self.DocumentStatus(SEE.enum.DocumentStatusCode.FINAL);
        self.Document.DocumentInfo.Status = self.DocumentStatus();

        var ds = SEE.service.DocumentService;
        ds.UpdateDocument(self.Document, function (result) {
        //ds.UpdateDocumentStatus(self.Document, function (result) {
           // SEE.session.MainVM.DisplayAlert("Document", "The document was finalized.", SEE.model.AlertType.INFO);
        });
    }

    self.Cancel = function () {
        if (previousSection != null) {
            self.DoSelectSection(previousSection);
            previousSection = null;
        }

        self.DocumentStatus(SEE.enum.DocumentStatusCode.DRAFT);
        self.IsReviewing(false);

        if (self.SelectedSection()) {
            self.SelectedSection().UI.CSSClass("active");
        }
        //SEE.session.MainVM.DisplayAlert("Document", "The document was was reverted to a draft state.", SEE.model.AlertType.INFO);
    }

    self.CloseDocument = function (onFinish) {
        SEE.service.DocumentService.ReleaseLockedSection(self.Document, self.SelectedSection().ParentPropertyName, function (section) {
            if (onFinish) {
                onFinish();
            }
        });
    };

    self.Send = function () {
        self.DocumentStatus(SEE.enum.DocumentStatusCode.SENT);
        self.Document.DocumentInfo.Status = self.DocumentStatus();        

        var ds = SEE.service.DocumentService;
        ds.UpdateDocumentStatus(self.Document, self.DocumentStatus(), function (result) {            
            ds.SendDocument(self.Document,
                function () {
                    self.DisplayAlert("Document Sent!", "A Webmail draft document has been created.", null, SEE.model.AlertType.INFO);
                },
                function(error, exception){
                    self.DisplayException("Document Not Sent!", "An error has occurred creating a Webmail draft document.: " + error, exception);
                }
            );
        });
    }

    self.NavigateToSection = function (sectionName) {
        var result = _.find(self.Sections(), function (section) {
            //return section instanceof sectionType;
            return section.Title() == sectionName;
        });
        if (result) {
            self.SelectedSection().UI.CSSClass("");
            self.DoSelectSection(result);
        }
    };

    self.LockAndDisplaySection = function (section, overrideLock) {

        var isReviewSection = (section instanceof SEE.viewmodel.document.section.ReviewSectionViewModel);
        var undefinedsection = (_.isUndefined(self.SelectedSection()) || _.isNull(self.SelectedSection()) || _.isEmpty(self.SelectedSection().Title()));

        var ChangeUI = function () {
            var index = self.Sections.indexOf(self.SelectedSection());
            if (self.SelectedSection()) {
                self.SelectedSection().UI.CSSClass("");
            }

            if (!_.isUndefined(previousSection) && previousSection != null) {
                previousSection.UI.CSSClass("");
            }

            previousSection = self.SelectedSection();
            self.SelectedSection(section);
            section.UI.CSSClass("active");

            if (self.SelectedSection().OnAfterRender !== undefined) {
                self.SelectedSection().OnAfterRender();
            }
        };

        var LockSection = function () {
            if (isReviewSection) {
                section.Locked(true);
                ChangeUI();
            } else {
                SEE.service.DocumentService.RetrieveAndLockSection(self.Document, section.ParentPropertyName, overrideLock, function (result) { //lock granted
                    if (result.Section && section.UpdateEntity) {
                        if (result.Section.Header) {
                            result.Section = result.Section.Header;
                        }
                        section.UpdateEntity(result.Section);
                    }
                    section.Locked(true);

                    //LockInfo will be undefined when you create a new document
                    if (result.LockInfo) {
                        section.LockedBy = result.LockInfo.LockedBy
                        section.LockTime(new Date(result.LockInfo.LockTime));
                    }
                    ChangeUI();
                }, function (result) { //lock denied
                    section.Locked(false);
                    if (result.LockedBy) {
                        section.LockedBy = result.LockedBy.FirstName + " " + result.LockedBy.LastName;
                    }
                    else {
                        section.LockedBy = "another user";
                    }
                    if (result.LockTime) {
                        section.LockTime(new Date(result.LockTime));
                    } else {
                        section.LockTime(new Date());
                    }
                    ChangeUI();
                });
            }
        };

        overrideLock = overrideLock || false; //default to false if nothing passed in

        if (!self.IsLoading() && self.SelectedSection().HasChanges && !overrideLock) {
            if (self.SelectedSection().HasChanges()) {
                bootbox.alert("You must save changes before moving to a new section.");
                //alert("You must save changes before moving to a new section.");
                return false;
            }
        }

        if ( !isReviewSection && !undefinedsection) {
            SEE.service.DocumentService.ReleaseLockedSection(self.Document, self.SelectedSection().ParentPropertyName, function (section) {
                LockSection();
            });
        } else {
            LockSection();
        }

        return true;
    }

    self.DoSelectSection = function (data) {
        //dismiss the alert from the previous section, in case it's still open
        self.DismissAlert();

        if (!self.IsLoading() && self.SelectedSection().HasChanges()) {
            self.Update(function () {
                //used by UI, don't override lock
                self.LockAndDisplaySection(data, false);
            });

            return true;
        } else {
            return self.LockAndDisplaySection(data, false);
        }
    };

    self.DoImportAllSections = function (baseDocument) {

        if (self.IsLoading()) {
            self.DisplayAlert("Import All", "There was a problem importing the document.", null,  SEE.model.AlertType.ERROR);
            return;
        }

        SEE.service.DocumentService.TransformSection(baseDocument, SEE.enum.SectionCode.ALL, function (Document) {
            _.each(self.Sections(), function (section) {
                if (_.isFunction(section.Import)) {
                    section.Import(Document, baseDocument._id, baseDocument.DocumentInfo.Title);
                }
            });
            
            _.each(Document.OtherSections, function (section) {
                self.Document.OtherSections.push(section);
            });
            self.DisplayAlert("Import All", "The import has finished successfully.", null, SEE.model.AlertType.SUCCESS);

            self.Document.DocumentInfo.Patient.Clone(self.Document.DocumentInfo.Header.Patient());
        });
    };

    self.ShowAlert = function(title, message, IsError){
        $("#alert-header").text(title);
        $("#alert-body").text(message);

        var alert = $("#alert");
        alert.removeClass("alert-error");
        alert.removeClass("alert-success");

        if (IsError){
            alert.addClass("alert-error");
        }
        else
            alert.addClass("alert-success");

        alert.alert();
    };

    self.DoSectionImport2 = function (fromTab) {

        if (fromTab) {
            if (self.SelectedSection().ImportSection && _.isFunction(self.SelectedSection().ImportSection)) {
                if (self.SelectedSection() === headerSection) {
                    sectionCode = SEE.enum.SectionCode.HEADER;
                } else {
                    mapEntry = SEE.model.DocumentSectionToSectionCode.findSection('DocumentPropertyName', self.SelectedSection().ParentPropertyName);
                    if (mapEntry) {
                        sectionCode = mapEntry.Enum;
                    } else {
                        self.DisplayAlert("Import Error!", "The section you are trying to import is not recognized by the system.",  null, SEE.model.AlertType.ERROR)
                    }
                }
                SEE.service.DocumentService.TransformSection(fromTab.ViewModel.Document, sectionCode, function (Document) {
                    self.SelectedSection().ImportSection(Document, fromTab.ViewModel.Document._id, fromTab.ViewModel.Document.DocumentInfo.Title);

                    var message = "<strong>" + self.SelectedSection().Title() + "</strong> have been imported into your document from:<br /><br /><strong>" + fromTab.Title() + "</strong><br /><strong>" + fromTab.Line2() + "</strong>";
                    self.DisplayAlert("Importing was successful!", null,  message, SEE.model.AlertType.SUCCESS)
                });
            } else {
                self.DisplayAlert("Import Error!", "This system does not support importing " + self.SelectedSection().Title(),  null, SEE.model.AlertType.ERROR)
            }
        }
        else {
            bootbox.alert("You must have a second document open before importing.");
        }
    };

    self.OnWindowClose = function () {
        SEE.service.DocumentService.ReleaseLockedSection(self.Document, self.SelectedSection().ParentPropertyName, function (section) {            
        });
    };

    window.onbeforeunload = self.OnWindowClose;
};