
//+++++++++++++++++++ WARNING ++++++++++++++++++++++++++
// This file was generated by a tool. DO NOT HAND EDIT!
//++++++++++++++++++++++++++++++++++++++++++++++++++++++
var user = require("./User.js").create();

exports.create = function () {
	var SectionLockInfo = function () {
		var self = this;
		self.LockedBy = user;
		self.LockTime = new Date();
		self.Lock = '';

	};

	return new SectionLockInfo();
};