ko.extenders.required = function (target) {
    if (!target.hasError) {
        target.hasError = ko.observable();

        function validate(newValue) {
            if (_.isDate(newValue)) {
                target.hasError(false);
                return;
            }
            target.hasError(_.isEmpty(newValue) ? true : false);
            //console.log("'" + newValue + "', error=" + target.hasError().toString());
        }

        validate(target());
        target.subscribe(validate);
    }
    return target;
};

ko.extenders.requiresOne = function (target) {
    if (!_.isFunction(target.hasError)) {
        target.hasError = ko.observable(false);

        function validate(newValue) {
            target.hasError(!newValue || newValue.length === 0);
        }

        validate(target());
        target.subscribe(validate);
    }
};
