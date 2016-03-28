SEE.namespace("SEE.viewmodel");

SEE.viewmodel.BaseViewModel = function () {

};

SEE.viewmodel.BaseViewModel.prototype.init = function () {
    var self = this;
    this.View = "";
    this.Name = ko.observable("BaseViewModel");
    this.IsLoaded = ko.observable(false);

    this.DisplayView = function (callback) {

        if (self.View.length === 0) {
            throw "No View is defined for this view.";
        }

        $.get("js/view/" + self.View + '?v=' + (new Date().getTime()), null, function (fileContents) {
            var tmpl = $.templates(fileContents);
            var htmlString = tmpl.render();
            $("#MainView").html(htmlString);
            callback();
        });
    };
};
