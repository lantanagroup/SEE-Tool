SEE.namespace("SEE.viewmodel.document.section");

SEE.viewmodel.document.section.AdvanceDirectivesSectionViewModel = function () {
    SEE.viewmodel.document.section.BaseDocumentSection.prototype.init.call(this);

    var self = this;

    self.Title("ADVANCE DIRECTIVES");
    self.UI.EditTemplateName("document/section/AdvanceDirectivesSection.html");
    self.Entity = ko.observable(new SEE.model.dto.AdvanceDirectivesSection());

    self.LoadEntity = function (document) {
        //call base class
        SEE.viewmodel.document.section.BaseDocumentSection.prototype.LoadEntity.call(self, document);


        self.Entity().Commit();
    };

    self.OnAfterRender = function (){

        var refreshText = function(newValue){
           self.DoGenerateText();
        } ;

        self.Entity().PrimaryHealthCareAgent().FirstName.subscribe(refreshText);
        self.Entity().AlternateHealthCareAgent().LastName.subscribe(refreshText);

        self.Entity().HealthcareProxyIsDifferent.subscribe(refreshText);
        self.Entity().Directives.ProxyInvoked.subscribe(refreshText);
        self.Entity().Directives.HCPCompetency.subscribe(refreshText);
        self.Entity().Directives.Resuscitation.subscribe(refreshText);
        self.Entity().Directives.MedicationOnlyNoCPR.subscribe(refreshText);
        self.Entity().Directives.VentilationRespiratoryDistress.subscribe(refreshText);
        self.Entity().Directives.MayUseIntubation.subscribe(refreshText);
        self.Entity().Directives.NonInvasiveVentilation.subscribe(refreshText);
        self.Entity().Directives.NonInvasiveVentilationLimitedTrial.subscribe(refreshText);
        self.Entity().Directives.UseOralIMorIVAntibiotics.subscribe(refreshText);
        self.Entity().Directives.UseOralAntibioticsOnly.subscribe(refreshText);
        self.Entity().Directives.UseOralAntibioticsOnlySymptomRelief.subscribe(refreshText);
        self.Entity().Directives.MedicationAny.subscribe(refreshText);
        self.Entity().Directives.MedicationAnyForSymptomRelief.subscribe(refreshText);
        self.Entity().Directives.MedicationPainReliefOnly.subscribe(refreshText);
        self.Entity().Directives.TransfusionsAnyBloodProduct.subscribe(refreshText);
        self.Entity().Directives.AllowHospitalTransferAny.subscribe(refreshText);
        self.Entity().Directives.AllowHospitalTransferSevere.subscribe(refreshText);
        self.Entity().Directives.AllowHospitalTransferNone.subscribe(refreshText);
        self.Entity().Directives.MedicalTestsAny.subscribe(refreshText);
        self.Entity().Directives.MedicalTestsLimited.subscribe(refreshText);
        self.Entity().Directives.GiveChronicDialysis.subscribe(refreshText);
        self.Entity().Directives.ArtificiallyAdministerFluids.subscribe(refreshText);
        self.Entity().Directives.Other.subscribe(refreshText);
        self.Entity().DateOfForm.subscribe(refreshText);
        self.Entity().ExpirationDate.subscribe(refreshText);
        self.Entity().VersionNumber.subscribe(refreshText);
        self.Entity().SignedPatientAttestation.subscribe(refreshText);
        self.Entity().SignedMDAttestation.subscribe(refreshText);
        self.Entity().SignedNPAttestation.subscribe(refreshText);
        self.Entity().AdvanceDirectiveDocument.subscribe(refreshText);
    }

    self.SaveEntity = function (document) {
        self.Entity().Author(SEE.session.User.PersonInfo);
        //call base class
        SEE.viewmodel.document.section.BaseDocumentSection.prototype.SaveEntity.call(self, document);
    };

    self.GetContactDetails = function (agent) {
        if (agent.FirstName() == '' && agent.LastName() == '')
            return null;

        var name = agent.FirstName() + ' ' + agent.LastName();
        if (agent.RelationshipToPatient() != '') {
            name += " - " + agent.RelationshipToPatient();
        }
        if (agent.Phone() != '') {
            name += " - " + agent.Phone();
        }
        return name;
    };

    self.DoGenerateText = function () {
        var contacts = [];

        if (self.Entity().PrimaryHealthCareAgent().LastName()) {
            contacts.push("Primary: " + self.GetContactDetails(self.Entity().PrimaryHealthCareAgent()));
        }
        if (self.Entity().AlternateHealthCareAgent().LastName()) {
            contacts.push("Alternate : " + self.GetContactDetails(self.Entity().AlternateHealthCareAgent()));
        }
        _.each(self.Entity().OtherContacts(), function (item, index) {
            contacts.push("Other : " + self.GetContactDetails(self.Entity().OtherContacts()[index]));
        });

        if (self.Entity().HealthcareProxyIsDifferent()) {
            contacts.push("Health care proxy is different");
        }

        var contactList = SEE.util.xml.BuildHtmlList(contacts);
        //var directiveList = SEE.util.xml.BuildHtmlList(directives);

        var doc = $("<root/>");

        if (contacts.length > 0 || self.Entity().HealthcareProxyIsDifferent()) {
            var title = $("<h4/>");
            title.text("Health Care Agents and Contacts");
            doc.append(title);
            doc.append(contactList);
        }

        var directivesList = $("<ul/>");
        //doc.append(list);


        if (self.Entity().Directives.ProxyInvoked()) {
            if (self.Entity().Directives.ProxyInvoked() == "Yes")
                directivesList.append($("<li>A Health Care proxy HAS been invoked</li>"));
            else
                directivesList.append($("<li>A Health Care proxy HAS NOT been invoked</li>"));

        }

        if (self.Entity().Directives.HCPCompetency()) {
            if (self.Entity().Directives.HCPCompetency() == "Yes")
                directivesList.append($("<li>There are concerns with the HCP's competency</li>"));
            else
                directivesList.append($("<li>There are NOT concerns with the HCP's competency</li>"));
        }

        if (self.Entity().Directives.Resuscitation()) {
            directivesList.append(AddItemToNarrativeList("Cardiopulmonary resuscitation: for a patient in cardiac or respiratory arrest: ", self.Entity().Directives.Resuscitation()));
        }

        if (self.Entity().Directives.MedicationOnlyNoCPR()) {
            directivesList.append(AddItemToNarrativeList("Prior to arrest, administer all medications needed to stabilize the patient, do not attempt CPR: ", self.Entity().Directives.MedicationOnlyNoCPR()));
        }
        if (self.Entity().Directives.VentilationRespiratoryDistress()) {
            directivesList.append(AddItemToNarrativeList("Ventilation: for a patient in respiratory distress: ", self.Entity().Directives.VentilationRespiratoryDistress()));
        }
        if (self.Entity().Directives.MayUseIntubation()) {
            directivesList.append(AddItemToNarrativeList("May use intubation and artificial ventilation if medically indicated: ", self.Entity().Directives.MayUseIntubation()));
        }
        if (self.Entity().Directives.NonInvasiveVentilation()) {
            directivesList.append(AddItemToNarrativeList("Non-invasive ventilation (e.g. CPAP, BiPAP): ", self.Entity().Directives.NonInvasiveVentilation()));
        }
        if (self.Entity().Directives.NonInvasiveVentilationLimitedTrial()) {
            directivesList.append(AddItemToNarrativeList("Use non-invasive ventilation (e.g. CPAP, BiPAP) time limited trial: ", self.Entity().Directives.NonInvasiveVentilationLimitedTrial()));
        }
        if (self.Entity().Directives.UseOralIMorIVAntibiotics()) {
            directivesList.append(AddItemToNarrativeList("Use oral, IM or IV Antibiotics: ", self.Entity().Directives.UseOralIMorIVAntibiotics()));
        }
        if (self.Entity().Directives.UseOralAntibioticsOnly()) {
            directivesList.append(AddItemToNarrativeList("Use oral only Antibiotics: ", self.Entity().Directives.UseOralAntibioticsOnly()));
        }
        if (self.Entity().Directives.UseOralAntibioticsOnlySymptomRelief()) {
            directivesList.append(AddItemToNarrativeList("Use oral only Antibiotics for symptom relief or comfort: ", self.Entity().Directives.UseOralAntibioticsOnlySymptomRelief()));
        }
        if (self.Entity().Directives.MedicationAny()) {
            directivesList.append(AddItemToNarrativeList("Give any medication that is clincially indicated: ", self.Entity().Directives.MedicationAny()));
        }
        if (self.Entity().Directives.MedicationAnyForSymptomRelief()) {
            directivesList.append(AddItemToNarrativeList("Give medications only for relief of symptoms or comfort: ", self.Entity().Directives.MedicationAnyForSymptomRelief()));
        }
        if (self.Entity().Directives.MedicationPainReliefOnly()) {
            directivesList.append(AddItemToNarrativeList("Do not administer medications except for pain relief: ", self.Entity().Directives.MedicationPainReliefOnly()));
        }
        if (self.Entity().Directives.TransfusionsAnyBloodProduct()) {
            directivesList.append(AddItemToNarrativeList("Transfusions/Any blood product: ", self.Entity().Directives.TransfusionsAnyBloodProduct()));
        }
        if (self.Entity().Directives.AllowHospitalTransferAny()) {
            directivesList.append(AddItemToNarrativeList("Transfer for any situation requiring hospital-level care: ", self.Entity().Directives.AllowHospitalTransferAny()));
        }
        if (self.Entity().Directives.AllowHospitalTransferSevere()) {
            directivesList.append(AddItemToNarrativeList("Transfer to hospital for severe pain or severe symptoms that cannot be controlled otherwise: ", self.Entity().Directives.AllowHospitalTransferSevere()));
        }
        if (self.Entity().Directives.AllowHospitalTransferNone()) {
            directivesList.append(AddItemToNarrativeList("Do not transfer to hospital, but treat with options available outside the hospital: ", self.Entity().Directives.AllowHospitalTransferNone()));
        }
        if (self.Entity().Directives.MedicalTestsAny()) {
            directivesList.append(AddItemToNarrativeList("Perform any medical tests indicated to diagnose and/or treat a medical condition: ", self.Entity().Directives.MedicalTestsAny()));
        }
        if (self.Entity().Directives.MedicalTestsLimited()) {
            directivesList.append(AddItemToNarrativeList("Perform limited medical tests necessary for symptomatic treatment or comfort: : ", self.Entity().Directives.MedicalTestsLimited()));
        }
        if (self.Entity().Directives.GiveChronicDialysis()) {
            directivesList.append(AddItemToNarrativeList("Give chronic dialysis for end-stage kedney disease if medically indicated: ", self.Entity().Directives.GiveChronicDialysis()));
        }
        if (self.Entity().Directives.ArtificiallyAdministerFluids()) {
            directivesList.append(AddItemToNarrativeList("Artificially administer fluids and nutrition if medically indicated: ", self.Entity().Directives.ArtificiallyAdministerFluids()));
        }
        if (self.Entity().Directives.Other()) {
            directivesList.append(AddItemToNarrativeList("Other Directives: ", self.Entity().Directives.Other()));
        }        


        if (directivesList.children().size() > 0) {
            var title = $("<h4/>");
            title.text("Directives");
            doc.append(title);
            doc.append(directivesList);
        }

        var formInfoList = $("<ul/>");

        if (self.Entity().DateOfForm()) {
            formInfoList.append(AddItemToNarrativeList("Date of form: ", SEE.util.GetFormattedDate(self.Entity().DateOfForm())));
        }
        if (self.Entity().ExpirationDate()) {
            formInfoList.append(AddItemToNarrativeList("Expiration date of form: ", SEE.util.GetFormattedDate(self.Entity().ExpirationDate())));
        }
        if (self.Entity().VersionNumber()) {
            formInfoList.append(AddItemToNarrativeList("Version number: ", self.Entity().VersionNumber()));
        }
        if (self.Entity().SignedPatientAttestation()) {
            formInfoList.append(AddItemToNarrativeList("Signed Patient Attestation: ", self.Entity().SignedPatientAttestation()));
        }
        if (self.Entity().SignedMDAttestation()) {
            formInfoList.append(AddItemToNarrativeList("Signed MD Attestation: ", self.Entity().SignedMDAttestation()));
        }
        if (self.Entity().SignedNPAttestation()) {
            formInfoList.append(AddItemToNarrativeList("Signed NP Attestation: ", self.Entity().SignedNPAttestation()));
        }
        if (self.Entity().AdvanceDirectiveDocument()) {
            formInfoList.append(AddItemToNarrativeList("Advance Directive Document (POLST/MOLST Document): ", self.Entity().AdvanceDirectiveDocument()));
        }


        if (formInfoList.children().size() > 0) {
            var title = $("<h4/>");
            title.text("Form Information");
            doc.append(title);
            doc.append(formInfoList);
        }

        var html = doc.html();
        self.Entity().GeneratedNarrative(html);
    };

    var AddItemToNarrativeList = function(text, value){
        var listItem = $("<li/>");
        listItem.text(text);
        listItem.append($("<strong>" + value + "</strong>"))
        return listItem;
    };

    self.DoAddContact = function () {

        var p =  new SEE.model.dto.PersonInfo();

        SEE.session.MainVM.Modal.ShowPersonInfoModal(p, "click to Add another contact", function(){
            self.Entity().OtherContacts().push(p);
            self.Entity().OtherContacts.valueHasMutated();
            self.DoGenerateText();
        });
    };

    self.DoAddMeContact = function () {
        var p =  new SEE.model.dto.PersonInfo();
        p.Clone(SEE.session.User.PersonInfo);
        self.Entity().OtherContacts().push(p);
        self.Entity().OtherContacts.valueHasMutated();
        self.DoGenerateText();
    };

    self.DoRemoveContact = function (item) {
        bootbox.confirm("Are you sure you want to delete this Contact? All data will be removed.", function(okPressed){
            if (okPressed){
                var index = -1;
                _.forEach(self.Entity().OtherContacts(), function (itm, i) {
                    if (itm == item) { index = i; };
                });
                if (index >= 0) {
                    self.Entity().OtherContacts.splice(index, 1);
                    self.Entity().OtherContacts.valueHasMutated();
                }
            self.DoGenerateText();
            }
        });
    };
};

SEE.viewmodel.document.section.AdvanceDirectivesSectionViewModel.inheritsFrom(SEE.viewmodel.document.section.BaseDocumentSection);