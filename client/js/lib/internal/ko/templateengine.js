ko.SeeTemplateEngine = function () {
    this.allowTemplateRewriting = false;
};

ko.SeeTemplateEngine.prototype = new ko.nativeTemplateEngine();

// Makes all templates SEE External Template Source
ko.SeeTemplateEngine.prototype.makeTemplateSource = function (template) {
    return new ko.templateSources.SeeTemplateSource(template);
};

//create template engine instance
ko.SeeTemplateEngine.instance = new ko.SeeTemplateEngine();
// set template engine
ko.setTemplateEngine(ko.SeeTemplateEngine.instance);
