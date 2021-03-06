
//+++++++++++++++++++ WARNING ++++++++++++++++++++++++++
// This file was generated by a tool. DO NOT HAND EDIT!
//++++++++++++++++++++++++++++++++++++++++++++++++++++++
var DocumentStatusCode = require("../Model/Enum/enum.js").DocumentStatusCode;
var headerSection = require("./HeaderSection.js").create();
var patient = require("./Patient.js").create();
var history = require("./DocumentHistory.js").create();
var instanceIdentifier = require("./InstanceIdentifier.js").create();

exports.create = function () {
	var DocumentInfo = function () {
		var self = this;
		self.Title = '';
		self.DateCreated = new Date();
		self.DateModified = new Date();
		self.Patient = patient;
		self.DocumentType = '';
		self.Status = DocumentStatusCode.DRAFT;
		self.Authors = [];
		self.GroupIdentifier = '';
		self.Header = headerSection;
		self.History = history;
		self.OtherDocumentIdentificationMetadata = instanceIdentifier;

	};

	return new DocumentInfo();
};