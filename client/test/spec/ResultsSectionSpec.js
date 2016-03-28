describe('LabResults', function () {
    it('Will load lab results correctly', function () {
        var viewModel = SEE.model.DocumentSectionToSectionCode.createSectionViewModel('ResultsSection');
        var document = new SEE.model.dto.Document();
        document.ResultsSection = new SEE.model.dto.ResultsSection();

        var labResult = new SEE.model.dto.LabResult();
        labResult.Name('INR');
        labResult.Value('1.25');
        labResult.Unit('mpg');
        labResult.DateObserved('2005/01/15');

        document.ResultsSection.LabResults.push(labResult);

        viewModel.LoadEntity(document);
        expect(viewModel.Entity().LabResults().length).toBe(1, "Expected a new result added to collection"); // Save for mock models added previously
    });
});