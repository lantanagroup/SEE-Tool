var fileSystem = require('fs'),
    DOMParser = require('xmldom').DOMParser,
    XmlSerializer = require('xmldom').XMLSerializer,
    uuid = require('./uuid.js'),
    _ = require("underscore");


exports.create = function () {
};

exports.xml = (function () {
    var utils = function () {
        var self = this;

        this.CreateNode = function (xmlDocument /*, nodeName, textNode || childElement */) {
            //first argument is xml document
            //second argument is node name
            //subsequent arguments will either be a text node (if string) or child element or attribute

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
                else {
                    node.appendChild(child);
                }
            }
            return node;
        };

        this.CreateAttributeWithNameAndValue = function (xmlDocument, name, value) {
            var node = xmlDocument.createAttribute(name);
            if (value == undefined) {
                value = "";
            }
            node.value = value;
            return node;
        };

        this.FindFirstElement = function (path, xmlNode) {
            var parsedPath = path.split('/'),
                firstElement, remainingPath, foundElement;
            
            if (_.isNull(path) || _.isUndefined(path)) {
                throw "Path must be specified in FindFirstElement";
            }

            if (_.isNull(xmlNode) || _.isUndefined(xmlNode)) {
                throw "xmlNode must be specified in FindFirstElement in call for finding '" + path + "'";
            }


            if (parsedPath.length > 0) {
                
                firstElement = parsedPath.shift();
                if (firstElement === '' && parsedPath.length > 0) { //was the path started with a '/', if so we get first element as empty string, goto second element
                    firstElement = parsedPath.shift();
                }

                foundElement = _.find(xmlNode.childNodes, function (n) {
                    return n.nodeName === firstElement;
                }, xmlNode);

                if (foundElement) {
                    if (parsedPath.length > 0) {
                        return this.FindFirstElement(parsedPath.join('/'), foundElement);
                    }
                    else {
                        return foundElement;
                    }
                }
            }
            return null;
        };

    }

    return new utils();
})();

exports.cda = (function () {
    var utils = function () {
        var self = this,
            xmlUtils = exports.xml,
            Σ = xmlUtils.CreateNode,
            A = xmlUtils.CreateAttributeWithNameAndValue;

        //refactor to include a date format string instead of just boolean "include time"
        self.toGTSString = function (date, includeTime) {
            var doubleDigit = function (str) {
                if (_.isNumber(str)) {
                    str = str.toString();
                }
                return (str.length < 2 ? ("0" + str) : str.substring(0,2));
            };

            var theDate = new Date(date);

            if (theDate.toString() != "Invalid Date") {
                return theDate.getFullYear().toString() + doubleDigit((theDate.getMonth() + 1).toString()) + doubleDigit(theDate.getDate().toString())
                           + (includeTime ? doubleDigit((theDate.getHours()+1)) + doubleDigit((theDate.getMinutes()+1)) + doubleDigit((theDate.getSeconds()+1)) : "");
            }
            else {                
                return date;
            }
        };

        self.fromGTSString = function (dateString) {
            var m, d, y, hr, min, newdate;

            if (_.isString(dateString)) {
                if (dateString.length >= 8) {
                    y = dateString.substring(0, 4);
                    m = dateString.substring(4, 6);
                    d = dateString.substring(6, 8);
                    if (dateString.length >= 12) {
                        hr = dateString.substring(8, 10);
                        min = dateString.substring(10, 12);
                    } 
                    
                    newdate = new Date(y, m - 1, d);

                    if (hr && min) {
                        newdate.setHours(hr);
                        newdate.setMinutes(min);
                    } 

                    return newdate;
                }
                else {
                    return dateString;
                }
            }
        };

        self.BuildTemplateIdWithRoot = function (rootId, document) {
            var newnode = Σ(document, 'templateId',
                                A(document, 'root', rootId));
            return newnode;
        };

        self.BuildCodedValueLOINC = function (code, displayName, document) {
            return self.BuildCD("code", code, displayName, "2.16.840.1.113883.6.1", "LOINC", document)
        };

        //returns a snomed CT CD xsi:type element with the given code. If no code is present, it will provide a nullFlavor of UNK
        self.BuildSnomedCTValueCD = function (code, displayName, document) {

            return self.BuildCodedValue(code, displayName, "2.16.840.1.113883.6.96", "SNOMED-CT", document)
        }

        //This is a value attribute with xsi:Type = CD
        self.BuildCodedValue = function (code, displayName, codeSystem, codeSystemName,  document) {

            var x = document;

            var codePresent = (code != null && code != "");

            return Σ(x, 'value', A(x, "xsi:type", "CD"),
                (!codePresent ? A(x, "nullFlavor", "UNK") : null), //if the code isn't known, we use a nullflavor
                (codePresent ? A(x, "code", code) : null),
                A(x, "displayName", displayName),
                (codePresent ? A(x, "codeSystem", codeSystem) : null),
                (codePresent ? A(x, "codeSystemName", codeSystemName) : null));
        }

        //This is a CD data type (code). examples of nodeName are "code", "administrativeGenderCode", etc.
        self.BuildCD = function (nodeName, code, displayName, codeSystem, codeSystemName,  document) {

            var x = document;

            var codePresent = (code != null && code != "");

            return Σ(x, nodeName,
                (!codePresent ? A(x, "nullFlavor", "UNK") : null), //if the code isn't known, we use a nullflavor
                (codePresent ? A(x, "code", code) : null),
                (codePresent ? A(x, "displayName", displayName) : null),
                (codePresent ? A(x, "codeSystem", codeSystem) : null),
                (codePresent ? A(x, "codeSystemName", codeSystemName) : null));
        }

        self.BuildAddress = function (document, type, streetAddressLine, city, state, postalCode, country) {
            var x = document;

            var streetAddressLinePresent = (streetAddressLine != null && streetAddressLine != "");
            var cityPresent = (city != null && city != "");
            var statePresent = (state != null && state != "");
            var postalCodePresent = (postalCode != null && postalCode != "");
            var countryPresent = (country != null && country != "");

            return Σ(x, "addr", A(x, "use", type),
                (streetAddressLinePresent ? Σ(x, "streetAddressLine", streetAddressLine) : null),
                (cityPresent ? Σ(x, "city", city) : null),
                (statePresent ? Σ(x, "state", state) : null),
                (postalCodePresent ? Σ(x, "postalCode", postalCode) : null),
                (country ? Σ(x, "country", country) : null)
                );
        };

        self.BuildPhoneNumber = function (document, phoneNumber, use) {
            if (phoneNumber == null || phoneNumber == "")
                return null;
            
            var x = document;

            return Σ(x, "telecom", A(x, "value", "tel:" + phoneNumber), A(x, "use", use));
        };

        self.BuildEmailAddress = function (document, email){
            if (email == null || email == "")
                return null;

            var x = document;

            return Σ(x, "telecom", A(x, "value", "mailto:" + email));
        };

        self.BuildName = function (document, firstName, middleName, lastName, suffix) {
            var firstNamePresent = (firstName != null && firstName != "");
            var middleNamePresent = (middleName != null && middleName != "");
            var lastNamePresent = (lastName != null && lastName != "");
            var suffixPresent = (suffix != null && suffix != "");

            if (!firstNamePresent && !middleNamePresent && !lastNamePresent)
                return null;

            var x = document;

            //L is for legal name
            return Σ(x, "name", A(x, "use", "L"),
                (firstNamePresent ? Σ(x, "given", firstName) : null),
                (middleNamePresent ? Σ(x, "given", middleName) : null),
                (lastNamePresent ? Σ(x, "family", lastName) : null),
                (suffixPresent ? Σ(x, "suffix", suffix) : null)
                );
        };

        self.BuildGender = function (document, genderCode)
        {
            if (genderCode == null || genderCode == "")
                return null;

            var x = document;

            return Σ(x, "administrativeGenderCode",
                        A(x, "code", genderCode),
                        A(x, "codeSystem", "2.16.840.1.113883.5.1"));
        }

        self.BuildAssignedEntity = function(document, personInfo){
            var x = document;
            var NPINumberExists = (personInfo.NPI != "" && personInfo.NPI != null);
            var npiNode = null;

            if(NPINumberExists) {
                npiNode = Σ(x, 'id',
                    (NPINumberExists ? A(x, "extension", personInfo.NPI) : null),
                    (NPINumberExists ? A(x, "root", "2.16.840.1.113883.4.6") : null));
            }

            var identifiersNode = null;

            if(personInfo.Identifiers && personInfo.Identifiers.length > 0) {
                identifiersNode = Σ(x, 'id', A(x, 'root', personInfo.Identifiers[0].Root),
                    A(x, 'extension', personInfo.Identifiers[0].Extension));
            }

            var assignedEntity = Σ(x, 'assignedEntity',
                npiNode,
                //other IDs
                identifiersNode,
                self.BuildPhoneNumber(x, personInfo.Phone, "HP"),
                self.BuildPhoneNumber(x, personInfo.AltPhone, "HP"),
                self.BuildPhoneNumber(x, personInfo.Pager, "MC"),

                self.BuildEmailAddress(x, personInfo.Email),

                Σ(x, 'assignedPerson',
                    self.BuildName(x, personInfo.FirstName, null, personInfo.LastName))
            );

            return assignedEntity;
        };

        self.BuildPerformer = function (document, personInfo, typeCode, functionCode, functionCodeSystem, functionCodeSystemName,
            functionCodeDisplayName) {

            var firstNameExists = (personInfo.FirstName != "" && personInfo.FirstName != null);
            var lastNameExists = (personInfo.LastName != "" && personInfo.LastName != null);

            if (!firstNameExists && !lastNameExists)
                return null;

            var x = document;

            //if no name, exit out totally, or just don't put assignedPerson?
            //if no NPINumber, do we null falvor?

            var cd = null;

            if(functionCode != "" || functionCode != null){
                cd = self.BuildCD("functionCode",
                    functionCode, functionCodeDisplayName, functionCodeSystem, functionCodeSystemName, x );
            }

            var assignedEntity = self.BuildAssignedEntity(document, personInfo);
            return Σ(x, 'performer', A(x, "typeCode", typeCode), cd, assignedEntity);
        };

        self.BuildParticipant = function (document, personInfo, typeCode, classCode,
            functionCode, functionCodeSystem, functionCodeDisplayName, functionCodeCodeSystemName) {

            if (personInfo == null)
                return null;

            var firstNameExists = (personInfo.FirstName != "" && personInfo.FirstName != null);
            var lastNameExists = (personInfo.LastName != "" && personInfo.LastName != null);

            if (!firstNameExists && !lastNameExists)
                return null;

            var x = document;

            //if no name, exit out totally, or just don't put assignedPerson?
            //if no NPINumber, do we null falvor?

            return Σ(x, 'participant', (typeCode ? A(x, "typeCode", typeCode) : null),

                (!_.isEmpty(functionCode) && !_.isNull(functionCode) && !_.isUndefined(functionCode) ?
                    self.BuildCD("functionCode", functionCode, functionCodeDisplayName, functionCodeSystem, functionCodeCodeSystemName, x )
                    : null),

                Σ(x, 'associatedEntity', (classCode ? A(x, "classCode", classCode) : null),

                    (personInfo.Identifiers.length > 0 ? Σ(x, 'id', A(x, 'root', personInfo.Identifiers[0].Root), A(x, 'extension', personInfo.Identifiers[0].Extension)) : null),

                    self.BuildPhoneNumber(x, personInfo.Phone, "HP"),
                    self.BuildPhoneNumber(x, personInfo.AltPhone, "HP"),
                    self.BuildPhoneNumber(x, personInfo.Pager, "MC"),

                    self.BuildEmailAddress(x, personInfo.Email),

                    Σ(x, 'associatedPerson',
                        self.BuildName(x, personInfo.FirstName, null, personInfo.LastName))
                )
            );
        };


        self.BuildGuardian = function (document, personInfo) {

            if (personInfo == null)
                return null;

            var firstNameExists = (personInfo.FirstName != "" && personInfo.FirstName != null);
            var lastNameExists = (personInfo.LastName != "" && personInfo.LastName != null);

            if (!firstNameExists && !lastNameExists)
                return null;

            var x = document;

            //if no name, exit out totally, or just don't put assignedPerson?
            //if no NPINumber, do we null flav-o-flav? 

            return Σ(x, 'guardian',
                    (personInfo.Identifiers.length > 0 ? Σ(x, 'id', A(x, 'root', personInfo.Identifiers[0].Root), A(x, 'extension', personInfo.Identifiers[0].Extension)) : null),

                    self.BuildPhoneNumber(x, personInfo.Phone, "HP"),
                    self.BuildPhoneNumber(x, personInfo.AltPhone, "HP"),
                    self.BuildPhoneNumber(x, personInfo.Pager, "MC"),

                    self.BuildEmailAddress(x, personInfo.Email),

                    Σ(x, 'guardianPerson',
                        self.BuildName(x, personInfo.FirstName, null, personInfo.LastName))
            );
        };

        self.BuildIdWithRoot = function (rootId, document) {
            return Σ(document, 'id',
                                A(document, 'root', rootId));
        };

        self.BuildIdWithRootAndExtension = function (rootId, extension, document) {
            var node = Σ(document, 'id', A(document, 'root', rootId), A(document, 'extension', extension));
            return node;
        };

        self.BuildStatusCode = function (statusCode, document) {
            var newnode = Σ(document, 'statusCode',
                                A(document, 'code', statusCode));
            return newnode;
        }

        self.BuildReferenceToText = function (value, document) {
            var newnode = Σ(document, 'text',
                                Σ(document, 'reference', value));
            return newnode;
        };

        self.BuildEffectiveTime = function (lowTime, highTime, instanceTime, includeTime, document) {
            return self.BuildTime(document, "effectiveTime", lowTime, highTime, instanceTime, includeTime);

            //if ((lowTime == null || lowTime == "") && (highTime == null || highTime == "") && (instanceTime == null || instanceTime == ""))
            //    return null;

            //var x = document;

            //return Σ(x, "effectiveTime",
            //        (instanceTime != null ? A(x, "value", self.toGTSString(instanceTime, includeTime)) : null),
            //        (lowTime != null ? Σ(x, 'low', A(x, "value", self.toGTSString(lowTime, includeTime))) : null),
            //        (highTime != null ? Σ(x, 'high', A(x, "value", self.toGTSString(highTime, includeTime))) : null));

        };

        self.BuildTime = function (document, nodeName, lowTime, highTime, instanceTime, includeTime) {
            //we got nothin
            if ((lowTime == null || lowTime == "") && (highTime == null || highTime == "") && (instanceTime == null || instanceTime == ""))
                return null;

            var x = document;

            return Σ(x, nodeName,
                    (instanceTime != null ? A(x, "value", self.toGTSString(instanceTime, includeTime)) : null),
                    (lowTime != null ? Σ(x, 'low', A(x, "value", self.toGTSString(lowTime, includeTime))) : null),
                    (highTime != null ? Σ(x, 'high', A(x, "value", self.toGTSString(highTime, includeTime))) : null));
        };

        self.CreateValuePQ = function (value, unit, document) {
            if (value === undefined || value === null || value === "") {
                return null;
            }

            var valueString = value;

            if (_.isNumber(value)) {
                valueString = value.toString();
            }

            var newnode = Σ(document, 'value',
                                A(document, 'xsi:type', 'PQ'),
                                A(document, 'value', valueString),
                                (unit !== null ? A(document, 'unit', unit) : null));            
            return newnode;
        };

        self.CreateInterpretationCodeCE = function (code, codeSystem, codeSystemName, displayName, document) {
            if (code === undefined || code === null || code === "") {
                return null;
            }

            var newnode = Σ(document, 'interpretationCode',
                                A(document, 'code', code),
                                (codeSystem !== null ? A(document, 'codeSystem', codeSystem) : null),
                                (codeSystemName !== null ? A(document, 'codeSystemName', codeSystemName) : null),
                                (displayName !== null ? A(document, 'displayName', displayName) : null));
            return newnode;
        };

        self.BuildSectionText = function (sectionModel, cdaDocument) {
            var x = cdaDocument;
            if (!sectionModel || !sectionModel.TransformedNarrative) {
                return null;
            }
            var containsTextElement = sectionModel.TransformedNarrative.indexOf('<text') >= 0;
            var parsedNarrative = (new DOMParser()).parseFromString(sectionModel.TransformedNarrative, "text/xml");
            var newNode = (containsTextElement ? parsedNarrative : Σ(x, "text"));
            _.each(parsedNarrative.childNodes, function (child) {
                newNode.appendChild(child, true);
            });
            return (containsTextElement ? newNode.childNodes[0] : newNode);
        };

        //expects structuredBody (ClinicalDocument/component/structuredBody) node
        self.FindSection = function (templateIdRoot, structuredBodyNode) {
            if (!templateIdRoot || !structuredBodyNode) {
                throw "Invalid use of FindSection, include templateId oid and the structured body node";
            }

            var sections = structuredBodyNode.getElementsByTagName('section');
            return _.find(sections, function (s) {
                var templateId = exports.xml.FindFirstElement('templateId', s);
                if (templateId && templateId.hasAttribute('root')) {
                    return templateId.getAttribute('root') === templateIdRoot;
                }

                return false;
            });
        };

        //expects cdaDocument parsed into xmldom 
        self.FindStructuredBody = function (cdaDocument) {
            if (!cdaDocument) {
                throw "Invalid use of FindStructuredBody, include an xmldom parsed cdaDocument";
            }

            return cdaDocument.getElementsByTagName('structuredBody')[0];
        };

        //expects structuredBody (ClinicalDocument/component/structuredBody) node
        self.FindSectionByCode = function (code, codeSystemOid, structuredBodyNode) {
            if (!code || !codeSystemOid || !structuredBodyNode) {
                throw "Invalid use of FindSectionByCode, include the code, codesystemoid and the structured body node";
            }

            var sections = structuredBodyNode.getElementsByTagName('section');
            return _.find(sections, function (s) {
                var codeNode = exports.xml.FindFirstElement('code', s);
                if (codeNode && codeNode.hasAttribute('code') && codeNode.hasAttribute('codeSystem')) {
                    return (codeNode.getAttribute('code') === code) && (codeNode.getAttribute('codeSystem') === codeSystemOid);
                }

                return false;
            });
        };
    };

    return new utils();
})();
