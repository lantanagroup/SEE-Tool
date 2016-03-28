var utils = require('../../../utils/utils.js');

exports.post = function (data, dataStores, req, res, log) {
    var DocumentStatusCode = require("../../../Model/Enum/enum.js").DocumentStatusCode;

    if (data && data.Document) {
        if (data.Document.DocumentInfo.Status === DocumentStatusCode.DRAFT) {
            //write out cda xml file
            var xml = utils.TransformCDAModelToXml(data.Document);
            data.Document.CdaXmlDocument.Xml = xml;
        }
        res.send(data.Document);
    }
    else {
        res.missingParameters("Document");
    }
};