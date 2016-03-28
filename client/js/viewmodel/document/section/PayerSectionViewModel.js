SEE.namespace("SEE.viewmodel.document.section");

SEE.viewmodel.document.section.PayerSectionViewModel = function () {
    SEE.viewmodel.document.section.BaseDocumentSection.prototype.init.call(this);

    var self = this;

    self.Title("PAYERS");
    self.UI.EditTemplateName("document/section/PayerSection.html");

    self.Entity = ko.observable(new SEE.model.dto.PayerSection());
    self.SelectedPolicy = ko.observable();
    self.SelectedPolicyIsNew = ko.observable(true);
    self.ParentViewModel = {};

    self.onPoliciesChanged = function () {
        var xmlDoc = $("<root/>");

        var list = $("<ul/>")

        if (self.Entity().PayerPolicies().length) {
            xmlDoc.append(list);

            _.each(self.Entity().PayerPolicies(), function (policy) {
                var policySummaryListItem = $("<li/>");
                var policySummaryText = policy.InsurerName();

                if (policy.InsurerPhone() && policy.InsurerPhone() != "") {
                    policySummaryText += " (" + policy.InsurerPhone() + ")";
                }

                if (policy.InsuranceType() && policy.InsuranceType() != "") {
                    policySummaryText += " " + policy.InsuranceType();
                }

                policySummaryListItem.text(policySummaryText);

                var childDetailsList = $("<ul/>");

                var policyMemberText = "";

                if (policy.PolicyNumber() && policy.PolicyNumber() != "") {
                    policyMemberText = "Policy Number: " + policy.PolicyNumber();
                }

                if (policy.MemberNumber() && policy.MemberNumber() != "") {
                    policyMemberText += ", Member Number: " + policy.MemberNumber();
                }

                if (policyMemberText != "") {
                    var policyMemberListItem = $("<li/>");
                    policyMemberListItem.text(policyMemberText);
                    childDetailsList.append(policyMemberListItem);
                }

                if (policy.PolicyDetails() && policy.PolicyDetails() != "") {
                    var policyDetailsListItem = $("<li/>");
                    policyDetailsListItem.text("Policy Details: " + policy.PolicyDetails());
                    childDetailsList.append(policyDetailsListItem);
                }

                if (policy.Guarantor() && policy.Guarantor() != "") {
                    var guarantorListItem = $("<li/>");
                    guarantorListItem.text("Guarantor: " + policy.Guarantor());
                    childDetailsList.append(guarantorListItem);
                }

                policySummaryListItem.append(childDetailsList);
                list.append(policySummaryListItem);
            });

            self.Entity().GeneratedNarrative(xmlDoc.html());
        }
        else {
            self.Entity().GeneratedNarrative('');
        }
    }

    self.displayPolicyModal = function () {
        $("#PolicyModal").modal('show');
    }

    //self.LoadEntity = function (document) {
        //call base object
    //    SEE.viewmodel.document.section.BaseDocumentSection.prototype.LoadEntity.call(self, document);

//    }

    self.OnAfterRender = function () {

        self.Entity().PayerPolicies.subscribe(function () {
            self.onPoliciesChanged();
        });

        if (self.Entity().GeneratedNarrative() == "") {
            self.onPoliciesChanged();
        }
    };

    self.SaveEntity = function (document) {
        self.Entity().Author = SEE.util.convertUserToAuthor(SEE.session.User);
        //call base class
        SEE.viewmodel.document.section.BaseDocumentSection.prototype.SaveEntity.call(self, document);
    };

    self.ClonePolicy = function (p) {
        var mapping = {};

        var js = ko.mapping.toJS(p);
        var t = new SEE.model.dto.PayerPolicy();
        ko.mapping.fromJS(js, mapping, t);
        return t;
    };

    self.DoAddPolicy = function () {
        self.SelectedPolicy(new SEE.model.dto.PayerPolicy());
        self.SelectedPolicyIsNew(true);

        self.displayPolicyModal();
    }

    self.DoEditPolicy = function (policy) {
        self.SelectedPolicyIsNew(false);
        var currentPolicy = self.ClonePolicy(policy);
        self.SelectedPolicy(currentPolicy);

        self.displayPolicyModal();
    }

    self.DoCancelPolicy = function () {
        if (!confirm("Any changes made to this dialog will be lost. Are you sure?")) {
            return;
        }

        $("#PolicyModal").modal('hide');
    }

    self.DoSavePolicy = function (document) {
        $('#PolicyModal').modal('hide');

        if (self.SelectedPolicyIsNew()) {
            self.Entity().PayerPolicies.push(self.SelectedPolicy());
        }
        else {            
            var match = _.find(self.Entity().PayerPolicies(), function (policy) {
                return self.SelectedPolicy().id() == policy.id();
            });

            var i = self.Entity().PayerPolicies().indexOf(match);

            if (i > -1) {
                self.Entity().PayerPolicies.replace(self.Entity().PayerPolicies()[i], self.SelectedPolicy());
            }
        }

        self.Entity().PayerPolicies.valueHasMutated();
    }

    self.DoRemovePolicy = function () {
        bootbox.confirm("Are you sure you want to delete this Payer Policy entry? All data will be removed.", function(okPressed){
            if (okPressed){
                var data = ko.utils.arrayFirst(self.Entity().PayerPolicies(), function (item) {
                    return self.SelectedPolicy().id() == item.id();
                });
                var index = _.indexOf(self.Entity().PayerPolicies(), data);

                if (index >= 0) {
                    self.Entity().PayerPolicies().splice(index, 1);
                    self.Entity().PayerPolicies.valueHasMutated();
                }

                self.DoCancelPolicy();
                self.DoGenerateText();
            }
        });
    };
}

SEE.viewmodel.document.section.PayerSectionViewModel.inheritsFrom(SEE.viewmodel.document.section.BaseDocumentSection);