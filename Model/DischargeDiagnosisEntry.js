
//+++++++++++++++++++ WARNING ++++++++++++++++++++++++++
// This file was generated by a tool. DO NOT HAND EDIT!
//++++++++++++++++++++++++++++++++++++++++++++++++++++++
var author = require("./Author.js").create();

exports.create = function () {
	var DischargeDiagnosisEntry = function () {
		var self = this;
		self.id = '';
		self.Author = author;
		self.Name = '';
		self.Code = '';
		self.DateOfOnset = new Date();
		self.ResolutionDate = '';
		self.Diagnoser = '';
		self.CurrentSeverity = '';
		self.CurrentSeverityName = '';
		self.WorstSeverity = '';
		self.WorstSeverityName = '';

	};

	return new DischargeDiagnosisEntry();
};