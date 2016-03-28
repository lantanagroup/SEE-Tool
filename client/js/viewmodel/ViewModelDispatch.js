SEE.namespace("SEE.viewmodel");

SEE.viewmodel.ViewModelDispatch = function () {
    var self = this, createNewTab;


    bindViewmodel = function (vm) {
        ko.cleanNode($("#MainView")[0]);
        $("#MainView").html('');
        SEE.session.MainVM.PageVM(vm);
    };

    self.Dispatch = function (vmtype, vmarg) {
        var vm = new vmtype();
        SEE.session.MainVM.CreateNewTab(vm);
        self.DispatchActiveViewModel(vm, vmarg);
        return vm;
    };


    self.DispatchActiveViewModel = function (vm, vmarg) {
        bindViewmodel(vm);

        vm.DisplayView(function () {
            ko.applyBindings(SEE.session.MainVM.PageVM, document.getElementById("MainView"));

            if (vm.IsLoaded() === false) {
                vm.IsLoaded(true);
                if (!_.isUndefined(vm.Load)) {
                    vm.Load(vmarg);
                }
            } else if (vm.IsLoaded() === true) {
                if (!_.isUndefined(vm.Activate)) {
                    vm.Activate(vmarg);
                }
            }
        });

    };


};