/// <reference path="../../js/lib/external/underscore/underscore.js" />
/// <reference path="../../js/viewmodel/document/section/VitalSignEntry.js" />

describe("VitalSignEntry", function () {

    beforeEach(function () {
    });

    it("should convert height to inches the user enters it in feet", function () {
        var entry = new SEE.model.dto.VitalSignEntry();

        entry.DoCalculateHeight("7'");

        expect(entry.Height()).toEqual('84');
        expect(entry.HeightUnit()).toEqual("in");
    });

    it("should convert height to inches the user enters it in feet and inches", function () {
        var entry = new SEE.model.dto.VitalSignEntry();

        entry.DoCalculateHeight("6'4");

        expect(entry.Height()).toEqual('76');
        expect(entry.HeightUnit()).toEqual("in");
    });

    it("should not convert height when it is just a number", function () {
        var entry = new SEE.model.dto.VitalSignEntry();

        entry.DoCalculateHeight("25");

        expect(entry.Height()).toEqual('25');
    });

    it("should not perform a height conversion when letters are entered", function () {
        var entry = new SEE.model.dto.VitalSignEntry();

        entry.DoCalculateHeight("A");

        expect(entry.Height()).toEqual("");
    });

    it("should calculate BMI for height and weight for imperial measurements", function () {
        var entry = new SEE.model.dto.VitalSignEntry();

        entry.Height(74);
        entry.HeightUnit("in");
        entry.Weight(215);
        entry.WeightUnit("lb")

        entry.DoCalculateBMI();

        expect(entry.BMI()).toEqual(27.6);
    });

    it("should calculate BMI for height and weight for metric measurements", function () {
        var entry = new SEE.model.dto.VitalSignEntry();

        entry.Height(188);
        entry.HeightUnit("cm");
        entry.Weight(90);
        entry.WeightUnit("kg")

        entry.DoCalculateBMI();

        expect(entry.BMI()).toEqual(25.5);
    });

    it("should calculate BMI for height and weight for mixed measurements (imperial/metric)", function () {
        var entry = new SEE.model.dto.VitalSignEntry();

        entry.Height(74);
        entry.HeightUnit("in");
        entry.Weight(90);
        entry.WeightUnit("kg")

        entry.DoCalculateBMI();

        expect(entry.BMI()).toEqual(25.5);
    });
});