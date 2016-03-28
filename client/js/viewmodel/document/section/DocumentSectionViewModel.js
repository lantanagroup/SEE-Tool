/// <reference path="../../../lib/external/underscore/underscore.js" />
/// <reference path="../utils/xml.js" />

SEE.namespace("SEE.viewmodel.document.section");

SEE.viewmodel.document.section.DocumentSectionViewModel = function () {
    SEE.viewmodel.document.section.BaseDocumentSection.prototype.init.call(this);
    var self = this, htmlTransformer, cdaTransformer;

    self.FreeNarrative = ko.observable("");
    self.OriginalFreeNarrative = "";
    self.HasLoaded = false;
    self.Entity = ko.observable({
        FreeNarrative: ko.computed({
            read: function () {
                return self.FreeNarrative();
            },
            write: function (val) {
                self.FreeNarrative(val);
                return self.FreeNarrative();
            }
        }),
        GeneratedNarrative: ko.computed(function () {
            return "";
        })
    });


    self.UI.EditTemplateName("document/section/Section.html");

    self.LoadEntity = function (document) {
        //don't call base object LoadEntity
        var narrative = "";
        if (document[self.ParentPropertyName] && document[self.ParentPropertyName].FreeNarrative) {
            if (ko.isObservable(document[self.ParentPropertyName].FreeNarrative)) {
                narrative = document[self.ParentPropertyName].FreeNarrative();
            } else {
                narrative = document[self.ParentPropertyName].FreeNarrative;
            }
            self.FreeNarrative(narrative);
            self.OriginalFreeNarrative = narrative;
        }
        self.HasLoaded = true;
    };

    self.HasChanges = function () {
        return self.HasLoaded ? (self.OriginalFreeNarrative !== self.FreeNarrative()) : false;
    }

    self.SaveEntity = function (document) {
        if (document[self.ParentPropertyName]) {
            document[self.ParentPropertyName].FreeNarrative = self.FreeNarrative();

            var nar = document[self.ParentPropertyName].FreeNarrative;

            if (nar != undefined && nar.length > 0) {
                nar = nar.replace(/<br>/gi, "<br/>");
                nar = nar.replace(/&nbsp;/gi, " ");

                document[self.ParentPropertyName].TransformedNarrative = SEE.util.narrativeToCDAHTML("<text>" + nar + "</text>");
            } else {
                document[self.ParentPropertyName].TransformedNarrative = SEE.util.narrativeToCDAHTML("<text> <br/> </text>");
            }
        }

        self.OriginalFreeNarrative = self.FreeNarrative();
    };

    self.UpdateEntity = function (entityJS) {
        if (ko.isObservable(entityJS.FreeNarrative)) {
            narrative = entityJS.FreeNarrative();
        } else {
            narrative = entityJS.FreeNarrative;
        }
        self.FreeNarrative(narrative);
        self.OriginalFreeNarrative = narrative;
    }
};

SEE.viewmodel.document.section.DocumentSectionViewModel.inheritsFrom(SEE.viewmodel.document.section.BaseDocumentSection);