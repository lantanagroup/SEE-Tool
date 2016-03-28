/// <reference path="../../js/lib/external/underscore/underscore.js" />


describe("PersonInfo Partial", function () {

    beforeEach(function () {
    });

    it("should calculate FullName based on First and Last Names", function () {
        var p = new SEE.model.dto.PersonInfo();

        p.FirstName("Test");
        p.LastName("Test2");

        expect(p.FullName()).toEqual("Test Test2");
    });

    it("should calculate FullName if either FirstName or LastName is missing", function () {
        var p = new SEE.model.dto.PersonInfo();

        p.FirstName("");
        p.LastName("Test2");

        expect(p.FullName()).toEqual("Test2", "The full name was not constructed correctly after blanking out first name.");

        p.FirstName("Test");
        p.LastName("");

        expect(p.FullName()).toEqual("Test", "The full name was not constructed correctly after blanking out last name.");
    });
});