/// <reference path="../../lib/external/underscore/underscore.js" />
/// <reference path="../../lib/internal/enum/enum.js" />
SEE.namespace("SEE.viewmodel");

SEE.viewmodel.DocumentListViewModel = function () {
    SEE.viewmodel.BaseViewModel.prototype.init.call(this);

    var self = this, textColumnSorter, dateColumnSorter, doSort, myTimer;

    self.Name("DocumentListViewModel");
    self.Title = ko.observable("Documents");
    self.View = "documentlist/DocumentList.html";
    self.Documents = ko.observableArray([]);
    self.Columns = {};
    self.Columns.Patient = 0;
    self.Columns.Title = 1;
    self.Columns.Status = 2;
    self.Columns.DateCreated = 3;
    self.Columns.LastModified = 4;
    self.Columns.Author = 5;
    self.Sort = {};
    self.Sort.Column = ko.observable(self.Columns.Patient);
    self.Sort.PropertyName = ko.observable("Patient");
    self.Sort.Ascending = 1;
    self.Sort.Descending = -1;
    self.Sort.Direction = ko.observable(self.Sort.Ascending);
    self.Filter = {};
    self.MenuCSS = {};
    self.MenuCSS.MenuAll = ko.observable("active");
    self.MenuCSS.MenuMRU = ko.observable("");
    self.MenuCSS.MenuDrafts = ko.observable("");
    self.MenuCSS.MenuFinal = ko.observable("");
    self.MenuCSS.MenuSent = ko.observable("");
    
    self.DocumentToNavigateTo = ko.observable({});
    
    self.StatusText = function (code) {
        if (code === SEE.enum.DocumentStatusCode.DRAFT) {
            return "Draft";
        } else if (code === SEE.enum.DocumentStatusCode.FINAL) {
            return "Final";
        } else if (code === SEE.enum.DocumentStatusCode.SENT) {
            return "Sent";
        } else {
            return "Unknown";
        }
    };

    self.ClearButtonClass = ko.observable("btn");

    self.SortIcon = function (column) {
            if (self.Sort.Direction() === self.Sort.Ascending) {
                return "icon-chevron-up";
            }

            return "icon-chevron-down";
        };

    self.ShowIcon = function (column) {
        if (column === self.Sort.Column()) {
            return true;
        }

        return false;
    };

    self.StatusIcon = function (code) {
        if (code === SEE.enum.DocumentStatusCode.DRAFT) {
            return "resources/images/DocumentHS.png";
        } else if (code === SEE.enum.DocumentStatusCode.FINAL) {
            return "resources/images/ProtectFormHS.png";
        } else if (code === SEE.enum.DocumentStatusCode.SENT) {
            return "resources/images/eps_closedHS.png";
        } else {
            return "";
        }
    };

    self.InitializeTypeAhead = function () {
        var ds = SEE.service.DocumentService;

        $('#search').typeahead({
            source: function (query, process) {
                return ds.Search(query, function (results) {
                    var mapped_results = [];
                    $.map(results, function (data) {
                        var group;
                        group = {
                            id: data.id,
                            name: data.Patient.PersonInfo.FirstName() + ' ' + data.Patient.PersonInfo.LastName() + '&nbsp;&nbsp;&nbsp;&nbsp;Title:' + data.Title + '&nbsp;&nbsp;&nbsp;&nbsp;Author:' + data.Author,
                            DocumentInfo: data,

                            toString: function () {
                                return JSON.stringify(this);
                            },
                            toLowerCase: function () {
                                return this.name.toLowerCase();
                            },
                            indexOf: function (string) {
                                return String.prototype.indexOf.apply(this.name, arguments);
                            },
                            replace: function (string) {
                                return String.prototype.replace.apply(this.name, arguments);
                            }
                        };
                        mapped_results.push(group);
                    });
                    return process(mapped_results);
                });
            },
            minLength: 3,
            display: 'name',
            val: 'id',
            updater: function (item) {
                var obj = JSON.parse(item);
                self.Filter = { "Id": obj.DocumentInfo.id };
                self.RefreshDocumentList();
                return obj.DocumentInfo.Patient.FirstName + ' ' +  obj.DocumentInfo.Patient.LastName;
            }
        });
    };

    self.RefreshDocumentList = function(callback, keepAlertsActive) {
        var ds = SEE.service.DocumentService;
        if (!keepAlertsActive) {
            SEE.session.MainVM.DismissAlert(); //clear any alerts
        }
        ds.RetrieveDocumentList(self.Filter, function (d) {
            self.Documents(d);
            doSort();
            self.SetActiveMenu(self.Filter);
            self.InitializeTypeAhead();

            if (callback) {
                callback();
            };
        });
    };

    self.Load = function (filter,callback) {
        self.Filter = filter;

        self.RefreshDocumentList(callback);
    };

    self.SetActiveMenu = function (filter) {
        self.MenuCSS.MenuAll("active");
        self.MenuCSS.MenuDrafts("");
        self.MenuCSS.MenuFinal("");
        self.MenuCSS.MenuSent("");
        self.MenuCSS.MenuMRU("");

        if (filter) {
            self.MenuCSS.MenuAll("");
            if (filter.MRU) {
                self.MenuCSS.MenuMRU("active");
            }
            else {
                switch (filter.Status) {
                    case SEE.enum.DocumentStatusCode.DRAFT:
                        self.MenuCSS.MenuDrafts("active");
                        break;
                    case SEE.enum.DocumentStatusCode.FINAL:
                        self.MenuCSS.MenuFinal("active");
                        break;
                    case SEE.enum.DocumentStatusCode.SENT:
                        self.MenuCSS.MenuSent("active");
                        break;
                    default:
                        self.MenuCSS.MenuAll("active");
                        break;
                }
            }
        }
    }

    self.doColumnClick = function (column, name) {
        doSort(column, name);
    };

    doSort = function (column, name) {
        var sortfunction;

        if (!_.isUndefined(column)) {
            if (column === self.Sort.Column()) {
                self.Sort.Direction(self.Sort.Direction() * -1);
            }
            else {
                self.Sort.Direction(self.Sort.Ascending);
            }
            self.Sort.Column(column);
            self.Sort.PropertyName(name);
        }
        else {
            column = self.Columns.Patient;
        }

        
        sortfunction = textColumnSorter;

        if (column === self.Columns.Patient) {
            sortfunction = patientColumnSorter;
        } else if (column === self.Columns.DateCreated || column === self.Columns.LastModified) {
            sortfunction = dateColumnSorter;
        } else if (column == self.Columns.Status) {
            sortfunction = numericColumnSorter;
        } else if (column == self.Columns.Author) {
            sortfunction = textColumnSorter;
        }

        self.Documents.sort(sortfunction);
    }

    patientColumnSorter = function (l, r) {
        var lname = l.Patient.PersonInfo.FirstName + l.Patient.LastName,
            rname = r.Patient.PersonInfo.FirstName + r.Patient.LastName;
        if (lname === rname) {
            return 0;
        } else if (lname < rname) {
            return -1 * self.Sort.Direction();
        } else if (lname > rname) {
            return 1 * self.Sort.Direction();
        }
    };

    textColumnSorter = function (l, r) {
        if (l[self.Sort.PropertyName()] === r[self.Sort.PropertyName()]) {
            return 0;
        } else if (l[self.Sort.PropertyName()] < r[self.Sort.PropertyName()]) {
            return -1 * self.Sort.Direction();
        } else if (l[self.Sort.PropertyName()] > r[self.Sort.PropertyName()]) {
            return 1 * self.Sort.Direction();
        }
    };

    numericColumnSorter = function (l, r) {
        if (l[self.Sort.PropertyName()] === r[self.Sort.PropertyName()]) {
            return 0;
        } else if (l[self.Sort.PropertyName()] < r[self.Sort.PropertyName()]) {
            return 1 * self.Sort.Direction();
        } else if (l[self.Sort.PropertyName()] > r[self.Sort.PropertyName()]) {
            return -1 * self.Sort.Direction();
        }
    };

    dateColumnSorter = function (l, r) {
        var ld = new Date(l[self.Sort.PropertyName()]), rd = new Date(r[self.Sort.PropertyName()]);
        if (ld === rd) {
            return 0;
        } else if (ld < rd) {
            return -1 * self.Sort.Direction();
        } else if (ld > rd) {
            return 1 * self.Sort.Direction();
        }
    };

    self.doRowClick = function (data) {
        if (SEE.ViewNavigator.CanNavigateTo(SEE.enum.View.DOCUMENT, data)) {
            SEE.ViewNavigator.NavigateTo(SEE.enum.View.DOCUMENT, data);
        }
        else {
            self.DocumentToNavigateTo(data);
            $('#ConfirmDocumentLoadModal').modal('show');
        }
    };
    
    self.DoContinueNavigation = function () {
        $('#ConfirmDocumentLoadModal').modal('hide');
        SEE.ViewNavigator.NavigateTo(SEE.enum.View.DOCUMENT, self.DocumentToNavigateTo());
    };
    self.DoCancelNavigation = function () {
        $('#ConfirmDocumentLoadModal').modal('hide');
    };

    self.NavigateUpload = function () {
        SEE.ViewNavigator.NavigateTo(SEE.enum.View.UPLOAD);
    };

    self.NavigateNewDocument = function () {
        SEE.ViewNavigator.NavigateTo(SEE.enum.View.DOCUMENT);
    };

    self.doStatusCodeClick = function (statusCode) {
        self.Filter = { "Status": statusCode };
        $('#search')[0].value = "";
        self.RefreshDocumentList();
    };

    self.doMRUClick = function () {
        self.Filter = { "MRU": 1 };
        $('#search')[0].value = "";
        self.RefreshDocumentList();
    };

    self.doShowAllClick = function () {
        self.Filter = undefined; //clear filter
        $('#search')[0].value = "";
        self.RefreshDocumentList();
    }

    self.ClearSearch = function () {
        self.Filter = {};
        self.RefreshDocumentList();
        $('#search')[0].value = "";
    };

    self.CheckForNewReceivedFiles = function () {
        //this is a temp method to kick off the process of checking for new received files on the server
        var ds = SEE.service.DocumentService;
        ds.CheckForNewReceivedFiles(function () {
            SEE.session.MainVM.DisplayAlert("Receiving files", "The server is checking the import queue (./drop/load folder).", SEE.model.AlertType.INFO);
            if (!myTimer) {
                myTimer = setInterval(function () {
                    self.Filter = {};
                    self.RefreshDocumentList();
                    SEE.session.MainVM.DisplayAlert("Receiving files", "Import complete", SEE.model.AlertType.SUCCESS);
                    window.clearInterval(myTimer);
                    myTimer = null;
                }, 3000);
            }
        });
    };

    self.RemoveAllDocuments = function () {
        var ds = SEE.service.DocumentService;
        ds.RemoveAllDocuments(function () {
            self.Filter = undefined; //clear filter
            self.RefreshDocumentList();
            SEE.session.MainVM.DisplayAlert("Remove Documents", "All documents have been removed.", SEE.model.AlertType.ALERT);
        });
    };

    self.getAge = function(dateString){
        var today = new Date();
        var birthDate = new Date(dateString);
        var age = today.getFullYear() - birthDate.getFullYear();
        var m = today.getMonth() - birthDate.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
            age--;
        }
        return age;
    }
};

SEE.viewmodel.DocumentListViewModel.inheritsFrom(SEE.viewmodel.BaseViewModel);