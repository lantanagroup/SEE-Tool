/// <reference path="../../js/lib/external/underscore/underscore.js" />
var sess = require('/client/session.js');

describe("DocumentViewModel", function () {
    var vm = new SEE.viewmodel.DocumentViewModel(), isFinished = false;

    beforeEach(function () {
        SEE.service.DocumentService.PopulateSampleData();
    });


    it("should be able to load", function () {
        runs(function () {
            vm.Load("50e5e8798219e03c15000001", function () {
                isFinished = true;
            });

        });

        waitsFor(function () {
            return isFinished;
        }, "DocumentViewModel did not finish executing!", 2000);

        runs(function () {
            expect(vm.Sections(), "Sections did not at least contain 1 section").toBeArrayWithAtLeastOneElement();
            expect(vm.Sections().length, "Incorrect number of sections, expected 22.").toBe(22);
        });
    });    

    it("should have demographic section", function () {
        var demographicSection;

        runs(function () {
            vm.Load("50e5e8798219e03c15000001", function () {
                isFinished = true;
            });

        });

        waitsFor(function () {
            return isFinished;
        }, "DocumentViewModel did not finish executing!", 2000);

        runs(function () {
            expect(_.any(vm.Sections(), function (s) {
                return s instanceof SEE.viewmodel.document.section.DemographicSectionViewModel;
            }), "Sections did not contain any demographic data").toBe(true);

            demographicSection = _.find(vm.Sections(), function (s) {
                return s instanceof SEE.viewmodel.document.section.DemographicSectionViewModel;
            });

            expect(demographicSection.Entity().Patient().PersonInfo.FirstName(), "Expected FirstName to be Jacob").toBe("Jacob");
            expect(demographicSection.Entity().Patient().PersonInfo.LastName(), "Expected LastName to be Martin").toBe("Martin");
        });
    });

});