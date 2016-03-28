describe('PayerPolicy', function () {
    var createPayerSection = function () {
        var payer = new SEE.model.dto.PayerSection();
        payer.GeneratedNarrative('This is a generated narrative');

        var payerPolicy = new SEE.model.dto.PayerPolicy();
        payerPolicy.InsurerName('payer1');
        payerPolicy.InsurerPhone('555-1212');
        payerPolicy.PolicyNumber('12345');
        payerPolicy.InsuranceType('type1');
        payerPolicy.MemberNumber('member1');
        payerPolicy.PolicyDetails('This is the main detail');
        payerPolicy.Guarantor('guarantor1');
        payer.PayerPolicies.push(payerPolicy);

        return payer;
    };

    it('Will save the payer policy entity correctly', function () {
        var document = new SEE.model.dto.Document();
        document.PayerSection = createPayerSection();

        var viewModel = new SEE.viewmodel.document.section.PayerSectionViewModel();
        viewModel.LoadEntity(document);

        expect(viewModel.Entity().GeneratedNarrative() == document.PayerSection.GeneratedNarrative());
    });

    it('Will edit policy correctly', function () {
        var viewModel = new SEE.viewmodel.document.section.PayerSectionViewModel();
        var modalOpened = false;
        viewModel.displayPolicyModal = function () { modal = true };

        var payerSection = createPayerSection();
        var policy = payerSection.PayerPolicies()[0];

        var policyCloned = false;
        viewModel.ClonePolicy = function (policy) {
            policyCloned = true;
            return policy;
        };

        viewModel.DoEditPolicy(policy);

        expect(!viewModel.SelectedPolicyIsNew());
        expect(viewModel.SelectedPolicy() == policy);
        expect(policyCloned);
        expect(modalOpened);
    });

    it('Will add a new policy correctly', function () {
        var viewModel = new SEE.viewmodel.document.section.PayerSectionViewModel();
        var modalOpened = false;
        viewModel.displayPolicyModal = function () { modal = true };

        viewModel.DoAddPolicy();

        expect(viewModel.SelectedPolicy() != null);
        expect(viewModel.SelectedPolicyIsNew() == true);
        expect(modalOpened);
    });

    it('Will map payer policy model correctly', function () {
        var document = new SEE.model.dto.Document();
        document.PayerSection = createPayerSection();

        var viewModel = SEE.model.DocumentSectionToSectionCode.createSectionViewModel('PayerSection');
        viewModel.LoadEntity(document);

        expect(viewModel.Entity().GeneratedNarrative() == document.PayerSection.GeneratedNarrative()).toBe(true, "Narrative did not match");

        expect(viewModel.Entity().PayerPolicies().length > 0).toBe(true, "No payer policies found after loading document.");
        var mappedPayerPolicy = viewModel.Entity().PayerPolicies()[0];
        var sourcePayerPolicy = document.PayerSection.PayerPolicies()[0];

        expect(sourcePayerPolicy.InsurerName() == mappedPayerPolicy.InsurerName()).toBe(true, "InsurerName does not match");
    });
});