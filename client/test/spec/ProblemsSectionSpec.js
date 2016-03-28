/// <reference path="../../js/lib/external/underscore/underscore.js" />
/// <reference path="../../js/lib/internal/model/ProblemSectionProblem.js" />

describe("DocumentProblemSection", function () {

    beforeEach(function () {
    });

    it("should be able to sort, first by IsActive", function () {
        var data = {
            LifeThreateningConditionPresent: true,
            DSM_AXIS_1: 'evil1',
            DSM_AXIS_2: 'evil2',
            DSM_AXIS_3: 'evil3',
            DSM_AXIS_4: 'evil4',
            Problems: [
                             {
                                 Name: 'a test problem',
                                 Code: 'code',
                                 ProblemFindings: 'findings',
                                 DateOfOnset: new Date(2013, 2, 1),
                                 ResolutionDate: new Date(2013, 2, 4)
                             },
                             {
                                 Name: 'b test problem',
                                 Code: 'code',
                                 ProblemFindings: 'findings',
                                 DateOfOnset: new Date(2013, 2, 1),
                                 ResolutionDate: null
                             }
            ]
        },
        problemSection = new SEE.model.dto.ProblemSection(),
        documentProblemSection = SEE.model.DocumentSectionToSectionCode.createSectionViewModel('ProblemSection'),
        document = new SEE.model.dto.Document(), //mock object
        data2;

        problemSection.fromJS(data);
        data2 = problemSection.toJS();

        document.ProblemSection = problemSection; //assemble mock object
        documentProblemSection.LoadEntity(document); //load entity and pass in mock object

        expect(documentProblemSection.Entity().Problems().length).toBe(2);  //number of objects in array should've just been two
        expect(documentProblemSection.Entity().Problems()[0].Name()).toBe('a test problem');

    });

    it("should be able to sort, second by Name", function () {
        var data = {
            LifeThreateningConditionPresent: true,
            DSM_AXIS_1: 'evil1',
            DSM_AXIS_2: 'evil2',
            DSM_AXIS_3: 'evil3',
            DSM_AXIS_4: 'evil4',
            Problems: [
                             {
                                 Name: 'a test problem',
                                 Code: 'code',
                                 ProblemFindings: 'findings',
                                 DateOfOnset: new Date(2013, 2, 1),
                                 ResolutionDate: new Date(2013, 2, 4)
                             },
                             {
                                 Name: 'b test problem',
                                 Code: 'code',
                                 ProblemFindings: 'findings',
                                 DateOfOnset: new Date(2013, 2, 1),
                                 ResolutionDate: new Date(2013, 2, 4)
                             }
            ]
        },
        problemSection = new SEE.model.dto.ProblemSection(),
        documentProblemSection = SEE.model.DocumentSectionToSectionCode.createSectionViewModel('ProblemSection'),
        document = new SEE.model.dto.Document(), //mock object
        data2;

        problemSection.fromJS(data);
        data2 = problemSection.toJS();

        document.ProblemSection = problemSection; //assemble mock object
        documentProblemSection.LoadEntity(document); //load entity and pass in mock object

        expect(documentProblemSection.Entity().Problems().length).toBe(2);  //number of objects in array should've just been two
        expect(documentProblemSection.Entity().Problems()[0].Name()).toBe('a test problem');
    });
});