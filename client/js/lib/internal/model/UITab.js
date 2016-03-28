SEE.namespace("SEE.model");

SEE.model.UITab = function () {
    var self = this;

    self.Title = ko.observable("");
    self.Line2 = ko.observable("");
    self.ViewModel = {};
    self.AllowClose = true;
    self.CSSClass = ko.observable("");
    self.id = SEE.util.GUID();
};