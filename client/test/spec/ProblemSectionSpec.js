/// <reference path="../../js/lib/external/underscore/underscore.js" />
/// <reference path="../../js/lib/internal/model/ProblemSectionProblem.js" />

describe("ProblemSection", function () {

    beforeEach(function () {
    });

    it("should be able to load json", function () {
        var data = {
            LifeThreateningConditionPresent: true,
            DSM_AXIS_1: 'evil1',
            DSM_AXIS_2: 'evil2',
            DSM_AXIS_3: 'evil3',
            DSM_AXIS_4: 'evil4',
            Problems : [
                             {
                                 Name: 'test problem',
                                 Code: 'code',
                                 ProblemFindings: 'findings'
                             }
            ]
        },
        problemSection = new SEE.model.dto.ProblemSection();

        problemSection.fromJS(data);

        expect(problemSection.LifeThreateningConditionPresent()).toEqual(data.LifeThreateningConditionPresent);
        expect(problemSection.DSM_AXIS_1()).toEqual(data.DSM_AXIS_1);
        expect(problemSection.DSM_AXIS_2()).toEqual(data.DSM_AXIS_2);
        expect(problemSection.DSM_AXIS_3()).toEqual(data.DSM_AXIS_3);
        expect(problemSection.DSM_AXIS_4()).toEqual(data.DSM_AXIS_4);
        expect(problemSection.Problems().length).toEqual(1);
        expect(problemSection.Problems()[0].Code()).toEqual(data.Problems[0].Code);
        expect(problemSection.Problems()[0].ProblemFindings()).toEqual(data.Problems[0].ProblemFindings);

    });

    it("should be able to go to json", function () {
        var data = {
            LifeThreateningConditionPresent: true,
            DSM_AXIS_1: 'evil1',
            DSM_AXIS_2: 'evil2',
            DSM_AXIS_3: 'evil3',
            DSM_AXIS_4: 'evil4',
            Problems: [
                             {
                                 Name: 'test problem',
                                 Code: 'code',
                                 ProblemFindings: 'findings'
                             }
            ]
        },
        problemSection = new SEE.model.dto.ProblemSection(),
        data2;

        problemSection.fromJS(data);
        data2 = problemSection.toJS();


        expect(problemSection.LifeThreateningConditionPresent()).toEqual(data2.LifeThreateningConditionPresent);
        expect(problemSection.DSM_AXIS_1()).toEqual(data2.DSM_AXIS_1);
        expect(problemSection.DSM_AXIS_2()).toEqual(data2.DSM_AXIS_2);
        expect(problemSection.DSM_AXIS_3()).toEqual(data2.DSM_AXIS_3);
        expect(problemSection.DSM_AXIS_4()).toEqual(data2.DSM_AXIS_4);
        expect(problemSection.Problems().length).toEqual(1);
        expect(problemSection.Problems()[0].Code()).toEqual(data2.Problems[0].Code);
        expect(problemSection.Problems()[0].ProblemFindings()).toEqual(data2.Problems[0].ProblemFindings);

    });
});