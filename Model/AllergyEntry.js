
//+++++++++++++++++++ WARNING ++++++++++++++++++++++++++
// This file was generated by a tool. DO NOT HAND EDIT!
//++++++++++++++++++++++++++++++++++++++++++++++++++++++
var author = require("./Author.js").create();

exports.create = function () {
	var AllergyEntry = function () {
		var self = this;
		self.id = '';
		self.Author = author;
		self.AllergyType = '';
		self.AllergyTo = '';
		self.Severity = '';
		self.Reaction = '';
		self.NoticeDate = new Date();

	};

	return new AllergyEntry();
};