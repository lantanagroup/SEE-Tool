
//+++++++++++++++++++ WARNING ++++++++++++++++++++++++++
// This file was generated by a tool. DO NOT HAND EDIT!
//++++++++++++++++++++++++++++++++++++++++++++++++++++++
var author = require("./Author.js").create();

exports.create = function () {
	var ProcedureOrderEntry = function () {
		var self = this;
		self.id = '';
		self.Author = author;
		self.OrderId = '';
		self.Name = '';
		self.Orderer = author;
		self.Amount = '';
		self.Frequency = '';
		self.Duration = '';
		self.Outcome = '';
		self.OrderDate = new Date();
		self.StartChangeDate = new Date();

	};

	return new ProcedureOrderEntry();
};