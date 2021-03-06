
//+++++++++++++++++++ WARNING ++++++++++++++++++++++++++
// This file was generated by a tool. DO NOT HAND EDIT!
//++++++++++++++++++++++++++++++++++++++++++++++++++++++
var author = require("./Author.js").create();

exports.create = function () {
	var VitalSignEntry = function () {
		var self = this;
		self.id = '';
		self.Author = author;
		self.DateRecorded = new Date();
		self.DateRecordedComment = '';
		self.Height = 0;
		self.HeightUnit = '';
		self.HeightComment = '';
		self.Weight = 0;
		self.WeightUnit = '';
		self.WeightComment = '';
		self.BMI = 0;
		self.BMIComment = '';
		self.SystolicBP = 0;
		self.SystolicBPComment = '';
		self.DiastolicBP = 0;
		self.DiastolicBPComment = '';
		self.HeartRate = 0;
		self.HeartRateComment = '';
		self.RespiratoryRate = 0;
		self.RespiratoryRateComment = '';
		self.HeartRhythmValue = 0;
		self.HeartRhythmComment = '';
		self.O2Sat = 0;
		self.O2SatComment = '';
		self.Temperature = 0.00;
		self.TemperatureUnit = '';
		self.TemperatureComment = '';
		self.HeartRhythmName = 0;
		self.HeartRhythmComment = '';

	};

	return new VitalSignEntry();
};