/// <reference path="../../js/lib/external/underscore/underscore.js" />
describe("Service", function () {
    var ds;
    beforeEach(function () {
        ds = new SEE.service.proxy.DocumentServiceProxy();
    });

    it("should be able to retrieve list of Documents", function () {
        var documents = [], isFinished = false;

        runs(function () {
            ds.RetrieveDocumentList(function (d) {
                documents = d;
                isFinished = true;
            });
        });

        waitsFor(function () {
            return isFinished;
        }, "Ajax Function Did Not Return Data", 2000);

        runs(function () {
            expect(documents.length > 0).toEqual(true);
        });
    });

    it("should be able to retrieve a single Document", function () {
        var cda, isFinished = false, id=1;

        runs(function () {
            ds.RetrieveDocument(id, function (d) {
                cda = d;
                isFinished = true;
            });
        });

        waitsFor(function () {
            return isFinished;
        }, "Ajax Function Did Not Return Data", 2000);

        runs(function () {
            expect(cda).toBeSomething();
            expect(cda).toBeValidCDA();
        });
    });

    it("should have sections", function () {
        var cda, isFinished = false, id=1;

        runs(function () {
            ds.RetrieveDocument(id, function (d) {
                cda = d;
                isFinished = true;
            });
        });

        waitsFor(function () {
            return isFinished;
        }, "Ajax Function Did Not Return Data", 2000);

        runs(function () {
            expect(cda.Sections).toBeArrayWithAtLeastOneElement();
        });
    });

});