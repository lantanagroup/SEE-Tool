var DocumentSectionToSectionCodeMap = require("../CDA/Constants.js").CONSTANTS.MAP.DocumentSectionToSectionCode,
    SectionCode = require("../Model/Enum/enum.js").SectionCode,
    assert = require("assert");

describe("Should map Sections to Section Codes.", function () {
    it("Should be able to lookup by section code enum", function () {
        var target = SectionCode.VITAL,
            section = DocumentSectionToSectionCodeMap.findSection('Enum', target);        
        assert.equal(DocumentSectionToSectionCodeMap.VitalsSection, section);
    });

    it("Should be able to lookup by section loinc code", function () {
        var target = '11450-4',
            section = DocumentSectionToSectionCodeMap.findSection('LoincCode', target);
        assert.equal(DocumentSectionToSectionCodeMap.ProblemSection, section);
    });

    it("Should be able to lookup by document property name", function () {
        var target = 'AdvanceDirectivesSection',
            section = DocumentSectionToSectionCodeMap.findSection('DocumentPropertyName', target);
        assert.equal(DocumentSectionToSectionCodeMap.AdvanceDirectivesSection, section);
    });
});