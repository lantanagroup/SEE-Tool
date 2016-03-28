
// TinyMCE databinding add-on
ko.bindingHandlers.tinymce = {
    init: function (element, valueAccessor, allBindingsAccessor, context) {
        var options = ko.toJS(allBindingsAccessor().tinymceOptions || {
            // Location of TinyMCE script
            script_url: 'js/lib/external/tiny_mce/tiny_mce.js',

            // General options
            theme: "advanced",
            plugins: "safari,lists,pagebreak,style,layer,table,iespell,inlinepopups,insertdatetime,preview,media,searchreplace,print,paste,directionality,fullscreen,noneditable,visualchars,nonbreaking,advlist",

            // Theme options
            theme_advanced_buttons1: "bold,italic,underline,|,fontsizeselect,|,bullist,numlist,",
            theme_advanced_buttons2: "tablecontrols,",
            theme_advanced_buttons3: "",
            theme_advanced_buttons4: "",
            theme_advanced_toolbar_location: "top",
            theme_advanced_toolbar_align: "left",
            theme_advanced_statusbar_location: "bottom",
            theme_advanced_resizing: false,
            theme_advanced_font_sizes : "10px,12px,14px,16px,24px",
            paste_auto_cleanup_on_paste: true,
            paste_remove_styles: true,


            element_format: "xhtml"
        });
        var modelValue = valueAccessor();


        //handle edits made in the editor
        options.setup = function (ed) {
            ed.onChange.add(function (ed, l) {
                if (ko.isWriteableObservable(modelValue)) {
                    element.isUpdatingContent = true;
                    modelValue(ed.getContent());
                    element.isUpdatingContent = false;
                }
            });
        };

        //handle destroying an editor (based on what jQuery plugin does)
        ko.utils.domNodeDisposal.addDisposeCallback(element, function () {
            $(element).parent().find("span.mceEditor,div.mceEditor").each(function (i, node) {
                var ed = tinyMCE.get(node.id.replace(/_parent$/, ""));
                if (ed) {
                    ed.remove();
                }
            });
        });

        //$(element).tinymce(options);
        setTimeout(function () {
            $(element).tinymce(options);
        }, 0);

    },
    update: function (element, valueAccessor, allBindingsAccessor, context) {
        if (!element.isUpdatingContent) {
            //handle programmatic updates to the observable
            var value = ko.utils.unwrapObservable(valueAccessor());
            $(element).html(value);
        }
    }
};

ko.bindingHandlers.spinner = {
    init: function (element, valueAccessor, allBindingsAccessor) {
        //initialize datepicker with some optional options
        var options = allBindingsAccessor().spinnerOptions;

        if (_.isUndefined(options)) {
            if ($(element).hasClass("numericSpinner")) {
                options = {
                    step: 0.01,
                    numberFormat: "n"
                };
            } else {
                options = { };
            }
        }

        $(element).spinner(options);

        //handle the field changing
        ko.utils.registerEventHandler(element, "spinchange", function () {
            var observable = valueAccessor();
            observable($(element).spinner("value"));
        });

        //handle disposal (if KO removes by the template binding)
        ko.utils.domNodeDisposal.addDisposeCallback(element, function () {
            $(element).spinner("destroy");
        });

    },
    update: function (element, valueAccessor) {
        var value = ko.utils.unwrapObservable(valueAccessor());

        var current = $(element).spinner("value");
        if (value !== current) {
            $(element).spinner("value", value);
        }
    }
};

ko.bindingHandlers.dateAsString = {
    update: function(element, valueAccessor, allBindingsAccessor) {
        var value = valueAccessor(),
            allBindings = allBindingsAccessor();
        var valueUnwrapped = ko.utils.unwrapObservable(value);
        var pattern = allBindings.datePattern || 'MM/dd/yy';
        //$(element).text(valueUnwrapped.toString(pattern));

        if (!_.isDate(valueUnwrapped) && _.isString(valueUnwrapped)) {
            var parsedDate = Date.parse(valueUnwrapped);
            if (!_.isNaN(parsedDate) && _.isNumber(parsedDate)) {
                valueUnwrapped = new Date(parsedDate);
            }
        }

        try{
            var theDate = valueUnwrapped instanceof Date ? valueUnwrapped : new Date(valueUnwrapped);
            var theDateText = theDate.f(pattern);

            $(element).text(theDateText);
            //$(element).text($.datepicker.formatDate(pattern ,valueUnwrapped));
        }
        catch(err)
        {
            throw "the dateAsString binding threw this exception:" + err + "\nvalue:" + valueUnwrapped + "\npattern:" + pattern + "\nThis is most likely because the value bound to this control isn't a date.";
        }
    }
}

ko.bindingHandlers.dateTimeAsString = {
    update: function(element, valueAccessor, allBindingsAccessor) {
        var value = valueAccessor(),
            allBindings = allBindingsAccessor();
        var valueUnwrapped = ko.utils.unwrapObservable(value);
        var datePattern = allBindings.datePattern || 'mm/dd/yy';
        var timePattern = allBindings.timePattern || 'hh:mm tt';
        //$(element).text(valueUnwrapped.toString(pattern));

        if (!_.isDate(valueUnwrapped) && _.isString(valueUnwrapped)) {
            var parsedDate = Date.parse(valueUnwrapped);
            if (!_.isNaN(parsedDate) && _.isNumber(parsedDate)) {
                valueUnwrapped = new Date(parsedDate);
            }
        }

        try{
            var text = $.datepicker.formatDate(datePattern ,valueUnwrapped) + " " +
                $.datepicker.formatTime(timePattern, {hour: valueUnwrapped.getHours(), minute: valueUnwrapped.getMinutes(), seconds:valueUnwrapped.getSeconds()}, {});;

            $(element).text(text);
        }
        catch(err)
        {
            throw "the dateAsString binding threw this exception:" + err + "\nvalue:" + valueUnwrapped + "\npattern:" + pattern + "\nThis is most likely because the value bound to this control isn't a date.";
        }
    }
}

ko.bindingHandlers.switch = {
    init: function (element, valueAccessor, allBindingsAccessor) {

        if (!element.id || element.id == '') {
            var elementId = '';

            if (allBindingsAccessor().elementId && allBindingsAccessor().elementId != '') {
                elementId = allBindingsAccessor().elementId;
            } else {
                elementId = SEE.util.GUID();
            }

            element.id = elementId;
        }

        var checkbox = $(element).find('input');
        //handle the field changing
        ko.utils.registerEventHandler(checkbox, "change", function () {
            var observable = valueAccessor();
            observable($(checkbox).is(":checked"));
        });

        //handle disposal (if KO removes by the template binding)
        ko.utils.domNodeDisposal.addDisposeCallback(element, function () {
            $(element).bootstrapSwitch("destroy");
        });

    },
    update: function (element, valueAccessor) {
        var value = ko.utils.unwrapObservable(valueAccessor());

        if (typeof value === "boolean")
        {
            $(element).bootstrapSwitch('setState', value);
        }
    }
};

ko.bindingHandlers.datepicker = {
    init: function (element, valueAccessor, allBindingsAccessor) {

        if (!element.id || element.id == '') {
            var elementId = '';

            if (allBindingsAccessor().elementId && allBindingsAccessor().elementId != '') {
                elementId = allBindingsAccessor().elementId;
            } else {
                elementId = SEE.util.GUID();
            }

            element.id = elementId;
        }

        //initialize datepicker with some optional options
        var options = allBindingsAccessor().datepickerOptions || {};
        $(element).datepicker(options);

        //handle the field changing
        ko.utils.registerEventHandler(element, "change", function () {
            var observable = valueAccessor();
            observable($(element).datepicker("getDate"));
        });

        //handle disposal (if KO removes by the template binding)
        ko.utils.domNodeDisposal.addDisposeCallback(element, function () {
            $(element).datepicker("destroy");
        });

    },
    update: function (element, valueAccessor) {
        var value = ko.utils.unwrapObservable(valueAccessor());
        var current = $(element).datepicker("getDate");

        if (value - current !== 0) {
            $(element).datepicker("setDate", value);
        }
    }
};

ko.bindingHandlers.datetimepicker = {
    init: function (element, valueAccessor, allBindingsAccessor) {

        if (!element.id || element.id == '') {
            var elementId = '';

            if (allBindingsAccessor().elementId && allBindingsAccessor().elementId != '') {
                elementId = allBindingsAccessor().elementId;
            } else {
                elementId = SEE.util.GUID();
            }

            element.id = elementId;
        }

        //initialize datepicker with some optional options
        var options = allBindingsAccessor().datepickerOptions || {};
        $(element).datetimepicker(options);

        //handle the field changing
        ko.utils.registerEventHandler(element, "change", function () {
            var observable = valueAccessor();
            try {
                observable($(element).datetimepicker("getDate"));//****
            }
            catch(ex) {}
        });

        //handle disposal (if KO removes by the template binding)
        ko.utils.domNodeDisposal.addDisposeCallback(element, function () {
            $(element).datetimepicker("destroy");
        });

    },
    update: function (element, valueAccessor) {
        var value = ko.utils.unwrapObservable(valueAccessor());
        var current = $(element).datetimepicker("getDate");

        if (value - current !== 0) {
            $(element).datetimepicker("setDate", value);
        }
    }
};