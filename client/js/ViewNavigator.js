SEE.namespace("SEE");

///view navigator abstracts away the viewmodel knowledge away from any caller that needs to open a view. Its aware of open tabs and will switch rather than opening new tab
SEE.ViewNavigator = new (function () {
    var self = this;
    var OpenDocuments = [];
    self.ActivePatient = null;

    var closeAlertIfOpen = function () {
        if (SEE.session.MainVM.HasMessage()) {
            SEE.session.MainVM.DismissAlert();
        }
    };

    self.NavigateTo = function (viewCode, arg) {
        closeAlertIfOpen();

        switch (viewCode) {
            case SEE.enum.View.DOCUMENTLIST:
                SEE.session.ViewModelDispatch.Dispatch(SEE.viewmodel.DocumentListViewModel);
                break;
            case SEE.enum.View.UPLOAD:
                SEE.session.ViewModelDispatch.Dispatch(SEE.viewmodel.UploadViewModel);
                break;
            case SEE.enum.View.DOCUMENT:
                return self.SwitchTabOrDispatch(SEE.viewmodel.DocumentViewModel, arg);              
                break;
        }
    };

    self.SwitchTabOrDispatch = function (vm, arg) {
        closeAlertIfOpen();
        if (_.isUndefined(arg)) {
            //new document
            return SEE.session.ViewModelDispatch.Dispatch(vm);
        }
        else {
            var tabOpen = _.some(SEE.session.MainVM.Tabs(), function (tab) {
                if (tab.ViewModel.Name() == "DocumentViewModel") {                        
                    return tab.ViewModel.Document._id == arg.id;
                }
                else {
                    return false;
                }
            });
            if (tabOpen) {
                //already open, have master vm switch tabs
                return SEE.session.MainVM.SwitchTab(arg.id);
            }
            else {                
                var openvm = SEE.session.ViewModelDispatch.Dispatch(vm, arg.id);
                OpenDocuments.push(arg);
                if (_.isEmpty(self.ActivePatient)) { self.ActivePatient = arg.Patient; }
                return openvm;
            }
        }
    };

    self.CloseDocument = function (vm) {
        closeAlertIfOpen();
        if (vm.Name() == "DocumentViewModel" && !_.isUndefined(vm.Document._id)) {
            if (vm.HasChanges()) {
                var retVal = confirm("The current section has changes that are not saved and will be lost if you close. Do you want to close?");
                if (retVal == false) {
                    return false;
                }
            }

            if (vm.CloseDocument) {
                vm.CloseDocument();
            }

            //sync ActivePatient with current open documents to avoid confirmation messages when not needed
            OpenDocuments = _.reject(OpenDocuments, function (doc) { return vm.Document._id == doc.id; });
            switch (OpenDocuments.length) {
                case 0:
                    self.ActivePatient = null;
                    break;
                case 1:
                    self.ActivePatient = OpenDocuments[0].Patient;
                    break;
                default:
                    //change ActivePatient if we have closed their last open document
                    if (!_.some(OpenDocuments, function (doc) {
                        return SEE.util.patient.IsPatientEqual(doc.Patient, self.ActivePatient);
                    })) {
                        self.ActivePatient = OpenDocuments[0].Patient;
                    }
                    break;
            }
        }
        return true;
    };

    self.IsDocumentOpen = function (id) {
        return _.some(OpenDocuments, function (doc) {
            return doc.id == id;
        });
    };

    self.CanNavigateTo = function (viewCode, arg) {
        var result;
        switch (viewCode) {
            case SEE.enum.View.DOCUMENTLIST:
                result = true;
                break;
            case SEE.enum.View.UPLOAD:
                result = true;
                break;
            case SEE.enum.View.DOCUMENT:
                if (_.isUndefined(arg)
                    || _.isEmpty(self.ActivePatient)
                    || SEE.util.patient.IsPatientEqual(self.ActivePatient, arg.Patient)
                    || SEE.ViewNavigator.IsDocumentOpen(arg.id)) {
                    return true;
                }
                else {
                    return false;
                }
                break;
        }
    };
});