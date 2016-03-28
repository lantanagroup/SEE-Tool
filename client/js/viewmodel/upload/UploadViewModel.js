/// <reference path="../../lib/external/underscore/underscore.js" />
SEE.namespace("SEE.viewmodel");

SEE.viewmodel.UploadViewModel = function () {
    SEE.viewmodel.BaseViewModel.prototype.init.call(this);

    var self = this;

    self.View = "upload/upload.html";
    self.Title = ko.observable("Upload");
    self.UploadStatus = ko.observable("");
    self.IsProcessing = ko.observable(false);

    self.Load = function (arg, callback) {
        if (callback) {
            callback();
        }
    };

    this.SetFileList = function (d, e) {
        this.FileList = e.target.files;
    };


    self.DoUpload = function () {
        var document = new SEE.model.dto.Document();
        var documentInfo = document.DocumentInfo;
        self.IsProcessing(true);
        // Loop through the FileList and render image files as thumbnails.
        for (var i = 0, f; f = this.FileList[i]; i++) {
            var series = [],
                reader = new FileReader();

            // Closure to capture the file information.
            reader.onload = (function (theFile) {
                return function (e) {
                    var data = e.target.result;
                    xmlDoc = SEE.util.xml.ParseXml(data);
                    var title = SEE.util.xml.FindFirstElement('ClinicalDocument/title', xmlDoc);
                    documentInfo.Title = SEE.util.xml.ExtractNodeValue(title);
                    documentInfo.DateCreated = SEE.util.GetFormattedDate(new Date());
                    documentInfo.DateModified = SEE.util.GetFormattedDate(new Date());

                    var given = SEE.util.xml.FindFirstElement('ClinicalDocument/recordTarget/patientRole/patient/name/given', xmlDoc);
                    documentInfo.Patient.PersonInfo.FirstName(SEE.util.xml.ExtractNodeValue(given));

                    var family = SEE.util.xml.FindFirstElement('ClinicalDocument/recordTarget/patientRole/patient/name/family', xmlDoc);
                    documentInfo.Patient.LastName(SEE.util.xml.ExtractNodeValue(family));
                    document.CdaXmlDocument.Xml = data;

                    var ds = SEE.service.DocumentService;
                    ds.CreateDocument(document, function () {
                        bootbox.alert("Update Successful.");
                        //alert('Update Successful');
                    });


                    if (_.isUndefined(data)) {
                        self.UploadStatus("Error, no data uploaded please check file format. It should be a valid CDA file.");
                    } else {
                    }

                    self.IsProcessing(false);
                };
            })(f);

            // Read in file as text.
            reader.readAsText(f);
        };
        self.IsProcessing(false);
    };
};

SEE.viewmodel.UploadViewModel.inheritsFrom(SEE.viewmodel.BaseViewModel);