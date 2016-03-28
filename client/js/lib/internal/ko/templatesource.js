SEE.templates = SEE.templates || {};
SEE.templateData = SEE.templateData || {};

ko.templateSources.SeeTemplateSource = function (templateName) {
    this.templateName = templateName;
};

ko.templateSources.SeeTemplateSource.prototype.getTemplate = function () {
    var self = this,
        cachedTemplate,
        templatePath;

    if (this.templateName === "") {
        return $("<div>")[0];
    }

    cachedTemplate = SEE.templates[this.templateName];
    templatePath = this.templateName;

    if (!cachedTemplate) {
        jQuery.ajax({
            url: 'js/view/' + templatePath + '?v=' + (new Date().getTime()),
            success: function (result) {
                if (result) {
                    cachedTemplate = result;
                }
            },
            async: false
        });
    }

    if (_.isString(cachedTemplate)) {
        SEE.templates[this.templateName] = $("<div>").append(cachedTemplate)[0];
        cachedTemplate = SEE.templates[this.templateName];
    }

    return cachedTemplate;
};

ko.templateSources.SeeTemplateSource.prototype.text = function (/* valueToWrite */) {
    if (arguments.length === 0) {
        return SEE.templateData[this.templateName].innerHtml;
    } else {
        throw new Error("setting text template not supported");
    }
};
ko.templateSources.SeeTemplateSource.prototype.data = function (key /*, valueToWrite */) {
    if (arguments.length === 1) {
        return SEE.templateData[this.templateName];
    } else {
        SEE.templateData[this.templateName] = arguments[1];
    }
};

ko.templateSources.SeeTemplateSource.prototype.nodes = function (key /*, valueToWrite */) {
    if (arguments.length === 0) {
        return this.getTemplate();
    } else {
        var valueToWrite = arguments[0];
        SEE.templates[this.templateName] = valueToWrite;
    }
};