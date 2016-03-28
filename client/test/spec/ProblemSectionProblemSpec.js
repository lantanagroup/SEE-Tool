/// <reference path="../../js/lib/external/underscore/underscore.js" />
/// <reference path="../../js/lib/internal/model/ProblemSectionProblem.js" />

describe("ProblemSectionProblem", function () {

    beforeEach(function () {
    });

    it("should be able to load json", function () {
        var problem = new SEE.model.dto.ProblemSectionProblem(),
            data = {
                Name: 'test problem',
                Code: 'code',
                ProblemFindings: 'findings'
            };

        problem.fromJS(data);

        expect(problem.Name()).toEqual(data.Name);
        expect(problem.Code()).toEqual(data.Code);
        expect(problem.ProblemFindings()).toEqual(data.ProblemFindings);

    });


    it("should be able to go to json", function () {
        var problem = new SEE.model.dto.ProblemSectionProblem(),
            data;

        problem.Name("test problem");
        problem.Code("code");
        problem.ProblemFindings("findings");

        data = problem.toJS();

        expect(problem.Name()).toEqual(data.Name);
        expect(problem.Code()).toEqual(data.Code);
        expect(problem.ProblemFindings()).toEqual(data.ProblemFindings);
    });

    it("should have full name", function () {
        var problem = new SEE.model.dto.ProblemSectionProblem();
        problem.Name("test problem");        

        expect(problem.Name()).toEqual(problem.FullName());
    });

    it("should be high risk", function () {
        var problem = new SEE.model.dto.ProblemSectionProblem();

        problem.Name('homicidal ideation');
        expect(problem.IsHighRisk()).toBe(true);
        
    });

    it("should not be high risk", function () {
        var problem = new SEE.model.dto.ProblemSectionProblem();

        problem.Name('flu');
        expect(problem.IsHighRisk()).toBe(false);
    });

    it("should be active", function () {
        var problem = new SEE.model.dto.ProblemSectionProblem();
        problem.ResolutionDate(null);
        expect(problem.IsActive()).toBe(true);
        //onset date should not matter
        problem.DateOfOnset(new Date(2013, 01, 01));
        expect(problem.IsActive()).toBe(true);
    });

    it("should not be active", function () {
        var problem = new SEE.model.dto.ProblemSectionProblem();
        problem.DateOfOnset(new Date(2012, 01, 01));
        problem.ResolutionDate(null);
        expect(problem.IsActive()).toBe(true);
        problem.ResolutionDate(new Date(2013, 01, 01));
        expect(problem.IsActive()).toBe(false);
    });
});