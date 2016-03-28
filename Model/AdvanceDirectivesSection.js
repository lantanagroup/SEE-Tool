
//+++++++++++++++++++ WARNING ++++++++++++++++++++++++++
// This file was generated by a tool. DO NOT HAND EDIT!
//++++++++++++++++++++++++++++++++++++++++++++++++++++++


exports.create = function () {
	var AdvanceDirectivesSection = function () {
		var self = this;

        var author = require("./Author.js").create();
        var primaryHealthCareAgent = require("./PersonInfo.js").create();
        var alternateHealthCareAgent  = require("./PersonInfo.js").create();
        var signedNPAttestation  = require("./PersonInfo.js").create();
        var signedMDAttestation  = require("./PersonInfo.js").create();
		self.Author = author;
		self.Directives = {};
		self.PrimaryHealthCareAgent = primaryHealthCareAgent;
		self.AlternateHealthCareAgent = alternateHealthCareAgent;
		self.OtherContacts = [];
		self.HealthcareProxyIsDifferent = false;
		self.FreeNarrative = '';
		self.GeneratedNarrative = '';
		self.TransformedNarrative = '';
		self.DateOfForm = '';
		self.VersionNumber = '';
		self.ExpirationDate = '';
		self.SignedPatientAttestation = '';
		self.SignedNPAttestation = signedNPAttestation;
		self.SignedMDAttestation = signedMDAttestation;
		self.AdvanceDirectiveDocument = '';

	};

	return new AdvanceDirectivesSection();
};