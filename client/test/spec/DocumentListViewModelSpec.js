var sess = require('/client/session.js');

describe("DocumentListViewModel", function () {
    beforeEach(function () {
        SEE.service.DocumentService.PopulateSampleData();
    });

    it("should be able to load DocumentListViewModel with no filter", function () {
        var isFinished = false, vm = new SEE.viewmodel.DocumentListViewModel(), filter = {};

        runs(function () {
            vm.Load(filter, function () {
                isFinished = true;
            });

        });

        waitsFor(function () {
            return isFinished;
        }, "DocumentListViewModel did not finish executing!", 2000);

        runs(function () {
            expect(vm.Documents().length > 0).toEqual(true);
        });
    });

    it("should be able to load DocumentListViewModel with a filter on status code", function () {
        var isFinished = false,
            vm = new SEE.viewmodel.DocumentListViewModel(),
            filter = { Status: SEE.enum.DocumentStatusCode.DRAFT };

        runs(function () {
            vm.Load(filter, function () {
                isFinished = true;
            });
        });

        waitsFor(function () {
            return isFinished;
        }, "DocumentListViewModel did not finish executing!", 2000);

        runs(function () {
            expect(vm.Documents().length).toEqual(2);
            expect(vm.Filter.Status).toEqual(SEE.enum.DocumentStatusCode.DRAFT);
        });
    });
});