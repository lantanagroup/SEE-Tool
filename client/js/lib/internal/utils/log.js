SEE.namespace("SEE.util");
SEE.util.log = function (str) {

    if (console && console.log) {
        var d = new Date();
        console.log(str, d);
    };

};
    