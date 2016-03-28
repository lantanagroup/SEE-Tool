SEE.namespace("SEE.viewmodel");

SEE.viewmodel.MainViewModel = function () {
    SEE.viewmodel.BaseViewModel.prototype.init.call(this);
    var self = this, updateTabTitles;

    self.PageVM = ko.observable({});
    self.Tabs = ko.observableArray();

    self.HasMessage = ko.observable(false);
    self.Message = ko.observable({});

    self.DisplayAlert = function (title, text, alertType) {
        var newAlert = new SEE.model.UIAlert();
        newAlert.SetDisplay(title, text, alertType);
        self.Message(newAlert);
        self.HasMessage(true);
    };
    self.DisplayException = function (title, text, error) {
        var newAlert = new SEE.model.UIAlert();
        newAlert.SetDisplayException(title, text, error);
        self.Message(newAlert);
        self.HasMessage(true);
    };

    self.DismissAlert = function () {
        self.HasMessage(false);
    };

    self.CloseAllDocumentTabs = function () {
        _.each(self.Tabs(), function (t) {
            if (t.ViewModel.Name() === "DocumentViewModel") {
                self.DoTabRemove(t);
            }
        });
    };
    
    self.IFrameContents = "";

    self.EnqueueIframeBody = function (html) {
        self.IFrameContents = html;
    }

    self.DequeueIFrameBody = function () {
        var content = self.IFrameContents;
        self.IFrameContents = "";
        return content;
    }

    updateTabTitles = function () {
        _.each(self.Tabs(), function (t) {
            t.Title(t.ViewModel.Title());


            if (t.ViewModel != null && t.ViewModel.Document != null && t.ViewModel.Document.DocumentInfo != null){
                if (t.ViewModel.Document.DocumentInfo.Status != SEE.enum.DocumentStatusCode.DRAFT)
                    t.Line2(t.ViewModel.Document.DocumentInfo.Title + " [" + new Date(t.ViewModel.Document.DocumentInfo.DateCreated).toLocaleDateString() + "]");
                else
                    t.Line2(t.ViewModel.Document.DocumentInfo.Title);
            }

        });
    };

    self.CreateNewTab = function (vm) {
        if (vm.Title) {
            var newTab = new SEE.model.UITab();
            newTab.Title(vm.Title());
            vm.Title.subscribe(updateTabTitles);
            newTab.ViewModel = vm;
            newTab.AllowClose = SEE.session.MainVM.Tabs().length > 0;
            self.Tabs().push(newTab);
            self.Tabs.valueHasMutated();
            self.SetActiveTab(newTab);
        }
    };

    self.DoTabRemove = function (tab) {
        var i = _.indexOf(self.Tabs(), tab);
        if (i > 0) {            
            if (SEE.ViewNavigator.CloseDocument(tab.ViewModel)) {
                self.Tabs().splice(i, 1);
                self.Tabs.valueHasMutated();
                lastTabIndex = self.Tabs().length - 1;
                self.DoTabClick(self.Tabs()[lastTabIndex]);
            }
        }
    };

    self.DoTabClick = function (tab) {
        self.SetActiveTab(tab);
        SEE.session.ViewModelDispatch.DispatchActiveViewModel(tab.ViewModel);
    };
    
    self.SwitchTab = function (id) {
        var t = _.find(self.Tabs(), function (tab) {
            if (tab.ViewModel.Name() == "DocumentViewModel") {
                return tab.ViewModel.Document._id == id;
            }
            else {
                return false;
            }
        });
        if (t) {
            self.DoTabClick(t);
            return t.ViewModel;
        }
        return null;
    };

    self.SetActiveTab = function (tab) {
        _.each(self.Tabs(), function (t) {
            if (tab === t) {
                t.CSSClass("active");
            }
            else {
                t.CSSClass("");
            }
            t.CSSClass.valueHasMutated();
        });
    };

    self.SignalDocumentListHasChanged = function () {
        _.each(self.Tabs(), function (t) {
            if (t.ViewModel.Name() === "DocumentListViewModel") {
                t.ViewModel.RefreshDocumentList(function () { }, true);
            }
        });
    };

    self.Modal = {};
    self.Modal.IsShowingModal = ko.observable(false);
    self.Modal.Template = ko.observable('');

    self.Modal.ModalVM = ko.observable({});

    self.Modal.Show = function (vm, arg, onsuccess, oncancel, addvalidators) {

        var loadModal = function () {
            if (self.Modal.ModalVM().LoadEntity) {
                self.Modal.ModalVM().LoadEntity(arg, onsuccess, oncancel, addvalidators);
            }
            self.Modal.Template(vm.UI.TemplateName());
            self.Modal.IsShowingModal(true);
            if (vm.OnAfterRender) {
                vm.OnAfterRender();
            }
            $('#ModalArea').on('hide', self.Modal.Cleanup);
            $('#ModalArea').modal('show');
        };
        
        self.Modal.ModalVM(vm);

        if (self.Modal.ModalVM().Initialize) {
            self.Modal.ModalVM().Initialize(loadModal);
        }
        else {
            loadModal();
        }
    };

    self.Modal.Cleanup = function () {
        if (self.Modal.IsShowingModal()) {
            self.Modal.IsShowingModal(false);
            self.Modal.Template('');
            self.Modal.ModalVM({});
        }
    };

    self.Modal.Close = function () {
        if (self.Modal.IsShowingModal()) {
            $('#ModalArea').modal('hide');
            self.Modal.IsShowingModal(false);
            self.Modal.Template('');
            self.Modal.ModalVM({});
        }
    }

    self.Modal.ShowPersonInfoModal = function(personInfo, title, onsuccess){
        var personModalViewModel = new SEE.viewmodel.modal.PersonInfoViewModel();

        if (title != undefined){
            personModalViewModel.Title(title);
        }

        SEE.session.MainVM.Modal.Show(personModalViewModel, personInfo, function (pi) {
            personInfo.Clone(pi);

            if(onsuccess)
            {
                onsuccess();
            }
        });
    };

    self.Modal.ShowOrganizationInfoModal = function(organizationInfo){
        var orgModalViewModel = new SEE.viewmodel.modal.OrganizationInfoViewModel();
        SEE.session.MainVM.Modal.Show(orgModalViewModel, organizationInfo, function (oi) {
            organizationInfo.Clone(oi);
        });
    };

    self.Modal.Alert = function (title, text) {
        var alertVM = new SEE.viewmodel.modal.AlertViewModel(),
            data = { Title: title, Text: text };

        SEE.session.MainVM.Modal.Show(alertVM, data, function () {
        });        
    };
};

SEE.viewmodel.MainViewModel.inheritsFrom(SEE.viewmodel.BaseViewModel);