
//+++++++++++++++++++ WARNING ++++++++++++++++++++++++++
// This file was generated by a tool. DO NOT HAND EDIT!
//++++++++++++++++++++++++++++++++++++++++++++++++++++++
var user = require("./User.js").create();
var EventDirectionCode = require("Enum/enum.js").EventDirectionCode;

exports.create = function () {
	var SectionHistory = function () {
		var self = this;
		self.Author = user;
		self.Event = '';
		self.SectionName = '';
		self.SourceDocumentId = '';
		self.EventTime = new Date();
		self.EventDirection = EventDirectionCode.IN;

	};

	return new SectionHistory();
};