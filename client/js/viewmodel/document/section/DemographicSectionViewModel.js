SEE.namespace("SEE.viewmodel.document.section");

SEE.viewmodel.document.section.DemographicSectionViewModel = function () {
    SEE.viewmodel.document.section.BaseDocumentSection.prototype.init.call(this);

    var self = this, serializePersonToObject, serializeOrgToObject, patientViewModel = new SEE.viewmodel.modal.PatientViewModel();
    self.ParentViewModel = null;
    self.Title("DEMOGRAPHICS");
    self.UI.EditTemplateName("document/section/DemographicSection.html");
    self.Entity = ko.observable(new SEE.model.dto.HeaderSection());
    self.HasLoaded = ko.observable(false);    
    self.IAmAlreadyAnAuthor = ko.observable(false);

    self.LoadEntity = function (document) {
        //do not call base class
        self.Entity = ko.observable(new SEE.model.dto.HeaderSection());
        delete document.DocumentInfo.Header.Patient["hasError"];
        self.Entity().fromJS.call(self.Entity(), document.DocumentInfo.Header);
        self.Entity().Custodian.valueHasMutated();


        self.HasLoaded(true);

        self.IAmAlreadyAnAuthor(AmIAlreadyInThisList(self.Entity().Authors()));

        //we set this inside of LoadEntity, because we're sure the entity is ready to be wired up...
        self.CanSave = ko.computed(function(){
             var hasError = (self.Entity().Patient().hasError() || (self.Entity().EncounterTime() == '' || self.Entity().EncounterTime() == null)
                 || self.Entity().Custodian().hasError());

            //var hasError = (self.Entity().EncounterTime() == '' || self.Entity().EncounterTime() == null);
            //(hasError ? SEE.session.MainVM.DisplayMessage("Missing Required Fields", "Please complete the required fields below in red to continue", SEE.model.AlertType.ERROR) : SEE.session.MainVM.DismissMessage());

            if (hasError){
                var newAlert = new SEE.model.UIAlert();
                newAlert.SetDisplay("Almost ready to save...", "Please complete the required fields below (*).", SEE.model.AlertType.ERROR);
                self.Message(newAlert);
            }
            else{
                self.Message(null);
            }

            return !hasError;
        });
    };

    self.SaveEntity = function (document) {
        //fix birthTime
        self.Entity().Patient().BirthTime(new Date(self.Entity().Patient().BirthTime()));
        document.DocumentInfo.Header = self.Entity().toJS();
        document.DocumentInfo.Patient.PersonInfo.FirstName = self.Entity().Patient().PersonInfo.FirstName();
        document.DocumentInfo.Patient.PersonInfo.LastName = self.Entity().Patient().PersonInfo.LastName();
        self.Entity().Commit();
        //should we put the author in here, rather than on the screen?
    };

    self.Import = function (document) {
        self.ImportSection(document.DocumentInfo.Header);
    }

    self.ImportSection = function (section) {        
        //add header specific fields (encounterTime, etc)., this should not import custodian.
        self.Entity().SendingSite().Clone(section.SendingSite);
        self.Entity().ClinicianToContactWithQuestions().Clone(section.ClinicianToContactWithQuestions);
        self.Entity().Patient().Clone(section.Patient);
        self.Entity().NextOfKin().Clone(section.NextOfKin);
        self.Entity().PrimaryCareGiverAtHome().Clone(section.PrimaryCareGiverAtHome);
        self.Entity().Guardian().Clone(section.Guardian);
        self.Entity().PrincipleCarePhysician().Clone(section.PrincipleCarePhysician);
        self.Entity().CarePlanManager().Clone(section.CarePlanManager);
        self.Entity().PrincipleHealthCareProvider().Clone(section.PrincipleHealthCareProvider);
        self.Entity().PrincipleCareGiver().Clone(section.PrincipleCareGiver);
       
        _.each(section.OtherMembersOfCareTeam, function (member) {
            var newMember = new SEE.model.dto.PersonInfo();
            newMember.Clone(member);
            self.Entity().OtherMembersOfCareTeam().push(newMember);
        });


        self.Entity().OtherMembersOfCareTeam.valueHasMutated();
    }

    self.DoImport = function (document) {
        var tabOpen = _.find(SEE.session.MainVM.Tabs(), function (tab) {
            return (tab.ViewModel.Name() === "DocumentViewModel" && tab.ViewModel !== self.ParentViewModel);
        });

        if (tabOpen) {
            SEE.service.DocumentService.TransformSection(tabOpen.ViewModel.Document, SEE.enum.SectionCode.HEADER, function (section) {
                self.ImportSection(section);
            });
        }
        else {
            bootbox.alert("You must have a second document open before importing.");
            //alert("You must have a second document open before importing.");
        }
    };

    self.DoPatientModal = function () {
        patientViewModel = new SEE.viewmodel.modal.PatientViewModel();
        SEE.session.MainVM.Modal.Show(patientViewModel, self.Entity().Patient(), function (patient) {
            self.Entity().Patient().Clone(patient);
            self.Entity().Patient().PersonInfo.FirstName.valueHasMutated();
        });
    };

    self.DoAddAuthor = function () {
        var p =  new SEE.model.dto.PersonInfo();

        SEE.session.MainVM.Modal.ShowPersonInfoModal(p, "click to Add document author", function(){
            self.Entity().Authors().push(p);
            self.Entity().Authors.valueHasMutated();
        });
    };

    self.DoAddMeAuthor = function () {
        var p =  new SEE.model.dto.PersonInfo();
        p.Clone(SEE.session.User.PersonInfo);
        self.Entity().Authors().push(p);
        self.Entity().Authors.valueHasMutated();
        self.IAmAlreadyAnAuthor(true);
    };

    self.DoRemoveAuthor = function (author) {
        bootbox.confirm("Are you sure you want to delete this Contact? All data will be removed.", function(okPressed) {
            if (okPressed){
                var target = _.find(self.Entity().Authors(), function (a) {
                    return a._oid_ === author._oid_;
                }), targetindex;

                if (target) {
                    targetindex = self.Entity().Authors().indexOf(target);
                    if (targetindex >= 0) {
                        self.Entity().Authors().splice(targetindex, 1);
                        self.Entity().Authors.valueHasMutated();
                    }

                    self.IAmAlreadyAnAuthor(AmIAlreadyInThisList(self.Entity().Authors()));
                }
            }
        });
    };

    self.DoAddCareTeamMember = function () {
        var p =  new SEE.model.dto.PersonInfo();

        SEE.session.MainVM.Modal.ShowPersonInfoModal(p, "click to Add care team member", function(){
            self.Entity().OtherMembersOfCareTeam().push(p);
            self.Entity().OtherMembersOfCareTeam.valueHasMutated();
        });
    };

    var AmIAlreadyInThisList = function(list){
        var target = _.find(list, function (a) {
            return a.FirstName() === SEE.session.User.FirstName && a.LastName() === SEE.session.User.LastName;
        });

        if (target){
            return true;
        }

        return false;
    };

    self.DoAddMeCareTeamMember = function () {
        var p =  new SEE.model.dto.PersonInfo();
        p.Clone(SEE.session.User.PersonInfo);
        self.Entity().OtherMembersOfCareTeam().push(p);
        self.Entity().OtherMembersOfCareTeam.valueHasMutated();
    };

    self.DoRemoveCareTeamMember = function (member) {
        bootbox.confirm("Are you sure you want to delete this Member of the Care Team? All data will be removed.", function(okPressed) {
            if (okPressed){
                var target = _.find(self.Entity().OtherMembersOfCareTeam(), function (a) {
                    return a._oid_ === member._oid_;
                }), targetindex;

                if (target) {
                    targetindex = self.Entity().OtherMembersOfCareTeam().indexOf(target);
                    if (targetindex >= 0) {
                        self.Entity().OtherMembersOfCareTeam().splice(targetindex, 1);
                        self.Entity().OtherMembersOfCareTeam.valueHasMutated();
                    }
                }
            }
        });
    };
};
SEE.viewmodel.document.section.DemographicSectionViewModel.inheritsFrom(SEE.viewmodel.document.section.BaseDocumentSection);