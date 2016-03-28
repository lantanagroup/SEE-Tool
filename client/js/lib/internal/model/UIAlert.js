SEE.namespace("SEE.model");

SEE.model.UIAlert = function () {
    var self = this;
    
    self.Title = ko.observable("");
    self.Text = ko.observable("");
    self.Html = ko.observable("");
    self.ErrorMessage = ko.observable("");
    self.ErrorStack = ko.observable("");
    self.UI = {};
    self.UI.CSSClass = ko.observable("");

    self.SetDisplay = function (header, message, alertType) {
        self.Title(header);
        self.Text(message);
        self.Html("");

        var css = "";

        switch (alertType.toLowerCase()) {
            case 'info':
                css = "alert alert-block alert-info span12 fade in";
                break;
            case 'success':
                css = "alert alert-block alert-success span12 fade in";
                break;
            case 'error':
                css = "alert alert-block alert-error span12 fade in";
                break;
            default:
                css = "alert alert-block span12 fade in";
                break;
        }
        self.UI.CSSClass(css);
    };

    self.SetDisplayException = function (header, message, err) {
        self.Title(header);
        self.Text(message);
        self.Html("");

        if (err)
        {
            self.ErrorMessage(err.message);
            self.ErrorStack(err.stack);
        }


        self.UI.CSSClass("alert alert-block alert-error span12 fade in");
    };

    self.SetHtmlDisplay = function (header, html, alertType) {
        self.Title(header);
        self.Text("");
        self.Html(html);

        var css = "";

        switch (alertType.toLowerCase()) {
            case 'info':
                css = "alert alert-block alert-info span12 fade in";
                break;
            case 'success':
                css = "alert alert-block alert-success span12 fade in";
                break;
            case 'error':
                css = "alert alert-block alert-error span12 fade in";
                break;
            default:
                css = "alert alert-block span12 fade in";
                break;
        }
        self.UI.CSSClass(css);
    };
};

SEE.model.AlertType = {
    ALERT: "alert",
    INFO: "info",
    SUCCESS: "success",
    ERROR: "error"
};