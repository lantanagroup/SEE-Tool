/// <reference path="../../js/lib/external/underscore/underscore.js" />
/// <reference path="../../js/viewmodel/document/section/VitalsSection.js" />

describe("VitalSection", function () {

    beforeEach(function () {
    });

    it("should be able to add vital", function () {
        var section = new SEE.viewmodel.document.section.VitalsSectionViewModel();
        var displayVitalModalCalled = false;

        section.DisplayVitalModal = function () {
            displayVitalModalCalled = true;
        };

        section.DoAddVital();

        expect(displayVitalModalCalled).toEqual(true);
        expect(section.SelectedVitalIsNew()).toEqual(true);
        expect(section.SelectedVital()).isDefined();

        //section.DoSaveVital();
    });
});