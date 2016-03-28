/// <reference path="../../external/underscore/underscore.js" />
SEE.namespace("SEE.util.xml");

// Object/Class
SEE.util.xml.transformer = function(xsltResourceUri)
{
    var self = this, transformXslt;
    var loadXslt;

    // Load the transform into transformXslt
    loadXslt = function (resourceUri) {
        var xhttp;
        if (window.XMLHttpRequest) {
            xhttp = new XMLHttpRequest();
        }
        else {
            xhttp = new ActiveXObject("Microsoft.XMLHTTP");
        }

        xhttp.open("GET", resourceUri + '?v=' + (new Date().getTime()), false);
        xhttp.send("");
        return xhttp.responseXML;
    };

    self.transformXslt = loadXslt(xsltResourceUri);    

    // Transform function... Executes the transform
    self.execute = function (inputXml, inputXmlString) {
        var transformedXml;

        // Transform inputXml
        if (window.ActiveXObject !== undefined) {
            //code for IE... IE 11 requires us to check for undefined rather than evaluate window.ActiveXObject
            var xslt = new ActiveXObject("Msxml2.XSLTemplate");
            var xslDoc = new ActiveXObject("Msxml2.FreeThreadedDOMDocument");
            xslDoc.loadXML(self.transformXslt.xml);
            xslt.stylesheet = xslDoc;
            var xslProc = xslt.createProcessor();
            var xmlDoc = new ActiveXObject("Msxml2.DOMDocument");
            xmlDoc.loadXML(inputXmlString);
            xslProc.input = xmlDoc;
            xslProc.transform();

            transformedXml = xslProc.output;
        }
        else if (document.implementation && document.implementation.createDocument) {
            // code for Mozilla, Firefox, Opera, etc.
            xsltProcessor = new XSLTProcessor();
            xsltProcessor.importStylesheet(self.transformXslt);
            transformedXml = xsltProcessor.transformToFragment(inputXml, document);
        }

        // Return the result
        return transformedXml;
    };

    return self;
};

// Helper methods
SEE.util.xml.ParseXml = function (xmlString) {
    var parser, xmlDoc;
    //read xml
    if (window.DOMParser) {
        parser = new DOMParser();
        xmlDoc = parser.parseFromString(xmlString, "text/xml");
    }
    else // Internet Explorer
    {
        xmlDoc = new ActiveXObject("Microsoft.XMLDOM");
        xmlDoc.async = false;
        xmlDoc.loadXML(xmlString);
    }

    return xmlDoc;
};

SEE.util.xml.FindFirstElement = function (path, xmlNode) {
    var parsedPath = path.split('/'),
        firstElement, remainingPath, foundElement;

    if (parsedPath.length > 0) {
        firstElement = parsedPath.shift();

        foundElement = _.find(xmlNode.childNodes, function (n) {
            return n.nodeName === firstElement;
        }, xmlNode);

        if (foundElement) {
            if (parsedPath.length > 0) {
                return SEE.util.xml.FindFirstElement(parsedPath.join('/'), foundElement);
            }
            else {
                return foundElement;
            }
        }
    }

    throw "Path not found: '" + path + "'";
};


SEE.util.xml.ExtractNodeValue = function (node) {
    var valueNode = _.find(node.childNodes, function (n) {
        return n.nodeType === 1;
    }, node),
    returnValue = "";

    if (valueNode) {
        returnValue = valueNode.nodeValue;
    } else if (node.childNodes.length > 0) {
        returnValue = node.childNodes[0].nodeValue;
    }

    return returnValue;
}

var formatXml = function (xml) {
    var reg = /(>)(<)(\/*)/g;
    var wsexp = / *(.*) +\n/g;
    var contexp = /(<.+>)(.+\n)/g;
    xml = xml.replace(reg, '$1\n$2$3').replace(wsexp, '$1\n').replace(contexp, '$1\n$2');
    var pad = 0;
    var formatted = '';
    var lines = xml.split('\n');
    var indent = 0;
    var lastType = 'other';
    // 4 types of tags - single, closing, opening, other (text, doctype, comment) - 4*4 = 16 transitions
    var transitions = {
        'single->single': 0,
        'single->closing': -1,
        'single->opening': 0,
        'single->other': 0,
        'closing->single': 0,
        'closing->closing': -1,
        'closing->opening': 0,
        'closing->other': 0,
        'opening->single': 1,
        'opening->closing': 0,
        'opening->opening': 1,
        'opening->other': 1,
        'other->single': 0,
        'other->closing': -1,
        'other->opening': 0,
        'other->other': 0
    };

    for (var i = 0; i < lines.length; i++) {
        var ln = lines[i];
        var single = Boolean(ln.match(/<.+\/>/)); // is this line a single tag? ex. <br />
        var closing = Boolean(ln.match(/<\/.+>/)); // is this a closing tag? ex. </a>
        var opening = Boolean(ln.match(/<[^!].*>/)); // is this even a tag (that's not <!something>)
        var type = single ? 'single' : closing ? 'closing' : opening ? 'opening' : 'other';
        var fromTo = lastType + '->' + type;
        lastType = type;
        var padding = '';

        indent += transitions[fromTo];
        for (var j = 0; j < indent; j++) {
            padding += '\t';
        }
        if (fromTo == 'opening->closing')
            formatted = formatted.substr(0, formatted.length - 1) + ln + '\n'; // substr removes line break (\n) from prev loop
        else
            formatted += padding + ln + '\n';
    }

    return formatted;
};

SEE.util.xml.ExtractTextFromSectionNode = function (node) {

    var returnValue = "";
    if (!_.isString(node)) {
        valueNode = _.each(node.childNodes, function (n) {
            returnValue = returnValue + (new XMLSerializer()).serializeToString(n);
        }, node);
    } else {
        returnValue = node;
    }

    returnValue = returnValue.replace(/ xmlns:cda="urn:hl7-org:v3"/gi, "");
    returnValue = returnValue.replace(/ xmlns="urn:hl7-org:v3"/gi, "");
    returnValue = returnValue.replace(/ xmlns:xhtml="http:\/\/www.w3.org\/1999\/xhtml"/gi, "");
    returnValue = returnValue.replace(/<br><\/br>/gi, "<br/>");

    return formatXml(returnValue);
};

SEE.util.xml.SerializeDocument = function (node) {
    return (new XMLSerializer()).serializeToString(node);
};

SEE.util.xml.BuildAuthenticatorSection = function (isLegalAuthenticatorElement, loggedInUser, xmlDocument) {

    var rootElementName = isLegalAuthenticatorElement ? 'legalAuthenticator' : 'authenticator';
    var Σ = SEE.util.xml.CreateNode;
    var x = xmlDocument;

    //TODO: insert real values from loggedInUser rather than just test data

    var node = Σ(x, rootElementName,
        Σ(x, 'time'),
        Σ(x, 'signatureCode'),
        Σ(x, 'assignedEntity',
            Σ(x, 'id'),
            Σ(x, 'addr',
                Σ(x, 'streetAddressLine', '1010 Village Avenue'),
                Σ(x, 'city', 'Sheridan'),
                Σ(x, 'state', 'WY'),
                Σ(x, 'postalCode', '99099'),
                Σ(x, 'country', 'US')
            ),
            Σ(x, 'telecom'),
            Σ(x, 'assignedPerson',
                Σ(x, 'name',
                    Σ(x, 'given', 'John'),
                    Σ(x, 'family', 'Doe')
                )
            )
        )
    );
    //add attributes to each element
    node.getElementsByTagName('time')[0].setAttribute('value', '20090427140000+0600');
    node.getElementsByTagName('signatureCode')[0].setAttribute('code', 'S');
    node.getElementsByTagName('id')[0].setAttribute('extension', '999999999');
    node.getElementsByTagName('id')[0].setAttribute('root', '2.16.840.1.113883.4.6');
    node.getElementsByTagName('telecom')[0].setAttribute('use', 'WP');
    node.getElementsByTagName('telecom')[0].setAttribute('value', 'tel:555-555-1021');

    var section = xmlDocument.getElementsByTagName(rootElementName)[0];
    xmlDocument.documentElement.replaceChild(node, section);
};



SEE.util.xml.CreateNode = function (xmlDocument /*, nodeName, textNode || childElement */) {
    //first argument is xml document
    //second argument is node name
    //subsequent arguments will either be a text node (if string) or child element

    var node = xmlDocument.createElement(arguments[1]), text, child;
    
    for (var i = 2; i < arguments.length; i++) {
        child = arguments[i];
        if (child == null)
            continue;

        if (typeof child == 'string') {
            child = xmlDocument.createTextNode(child);
            node.appendChild(child);
        }
        if (typeof child == 'object' && child.nodeType == 2) {
            node.setAttributeNode(child);
        }
        else{
            node.appendChild(child);
        }
    }
    return node;
};

SEE.util.xml.CreateAttribute2 = function (xmlDocument, name, value) {
    var node = xmlDocument.createAttribute(name);
    node.nodeValue = value;
    return node;
};

SEE.util.xml.CreateAttribute = function (xmlDocument, element, attribute, value) {
    var node = xmlDocument.createAttribute(attribute);
    node.nodeValue = value;
    element.setAttribute(node);
    return element; //return the element so that we can recursively build the hierarchy
};

SEE.util.xml.NSResolver = function nsResolver(prefix) {
    var ns = {
        'xhtml' : 'http://www.w3.org/1999/xhtml',
        'cda' : 'urn:hl7-org:v3'
    };
    return ns[prefix] || null;
};

SEE.util.xml.SelectSingle = function (node, xpath) {
    var doc = node.ownerDocument;

    return doc.evaluate(xpath, node, SEE.util.xml.NSResolver, XPathResult.FIRST_ORDERED_NODE_TYPE, null)
};



SEE.util.xml.CreateHtmlTable = function(columnHeaders, caption, rows) {
    var xmlDoc = $("<root></root>");

    var table = $("<table border='1' cellpadding='2' cellspacing='2' width='100%'/>");
    xmlDoc.append(table);

    if (!_.isUndefined(caption) && caption != '') {
        var caption = $("<caption>" + caption + "</caption>");
        table.append(caption);
    }

    var head = $("<thead/>");
    table.append(head);

    var headerRow = $("<tr/>");
    head.append(headerRow);

    _.each(columnHeaders, function(s) {
        var newColumn = $("<th/>");
        newColumn.text(s);
        headerRow.append(newColumn);
    });

    var body = $("<tbody/>");
    table.append(body);

    _.each(rows, function(s) {
        var newRow = $("<tr/>");
        body.append(newRow);

        _.each(s, function(x) {
            var newColumn = $("<td/>");
            newColumn.text(x);
            newRow.append(newColumn);
        });
    });

    return xmlDoc.html();
};

SEE.util.xml.BuildHtmlList = function (items) {
    //var doc = JQueryXmlDocument;

    var list = $("<ul/>")
    //doc.append(list);

    _.each(items, function (s) {
        var listItem = $("<li/>");
        listItem.text(s);
        list.append(listItem);
    });

    return list;
};

SEE.util.xml.CreateHtmlList = function(items, caption) {
    var xmlDoc = $("<root/>");

    if (!_.isUndefined(caption) && caption != '') {
        var captionEle = $("<h4>" + caption + "</h4>");
        xmlDoc.append(captionEle);
    }

    var list = $("<ul/>")
    xmlDoc.append(list);

    _.each(items, function(s) {
        var listItem = $("<li/>");
        listItem.text(s);
        list.append(listItem);
    });

    return xmlDoc.html();
};