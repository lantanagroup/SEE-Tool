SEE = {};
SEE.namespace = function (nsString) {
    var parts = nsString.split('.'),
        parent = SEE,
        i;

    // strip leading global
    if (parts[0] === "SEE") {
        parts = parts.slice(1);
    }

    for (i = 0; i < parts.length; i += 1) {
        if (typeof parent[parts[i]] === "undefined") {
            parent[parts[i]] = {};
        }
        parent = parent[parts[i]];
    }

    return parent;
};
SEE.namespace("SEE.util");
SEE.namespace("SEE.util.date");
SEE.namespace("SEE.util.name");

Function.prototype.inheritsFrom = function (parentClassOrObject) {
    if (parentClassOrObject.constructor === Function) {
        //Normal Inheritance
        this.prototype = new parentClassOrObject();
        this.prototype.constructor = this;
        this.prototype.parent = parentClassOrObject.prototype;
    }
    else {
        //Pure Virtual Inheritance
        this.prototype = parentClassOrObject;
        this.prototype.constructor = this;
        this.prototype.parent = parentClassOrObject;
    }
    return this;
};

SEE.namespace("SEE.util.patient");
SEE.util.patient.IsPatientEqual = function (patient1, patient2) {
    //compare two patient objects to see if the patient is the same
    //TODO: add other rules
    return patient1.PersonInfo.FirstName.toLowerCase() == patient2.PersonInfo.FirstName.toLowerCase() && patient1.PersonInfo.LastName.toLowerCase() == patient2.PersonInfo.LastName.toLowerCase()
};

SEE.util.patient.FullName = function (patient) {
    if (patient) {
        return patient.PersonInfo.FirstName() + " " + patient.PersonInfo.LastName();
    }

    return "";
};

SEE.util.GUID = function () {
    var S4 = function () {
        return Math.floor(
                Math.random() * 0x10000 /* 65536 */
            ).toString(16);
    };

    return (
            S4() + S4() + "-" +
            S4() + "-" +
            S4() + "-" +
            S4() + "-" +
            S4() + S4() + S4()
        );
};

SEE.util.isObservableArray = function (obj) {
    return (ko.isObservable(obj) && obj.indexOf);
};

SEE.util.UnwrapObservable = function (prop) {
    if (ko.isObservable(prop)) {
        return prop();
    } else {
        return prop;
    }
};

SEE.util.narrativeToHTML = function (narrativeString) {    
	var cdaTransformer = new SEE.util.xml.transformer("resources/stylesheet/NarrativeToHtml.xslt");
    return SEE.util.xml.ExtractTextFromSectionNode(cdaTransformer.execute(SEE.util.xml.ParseXml(narrativeString), narrativeString));
};

SEE.util.narrativeToCDAHTML = function (narrativeString) {
    var htmlTransformer = new SEE.util.xml.transformer("resources/stylesheet/HtmlToNarrative.xslt");
    var docNode = SEE.util.xml.ParseXml(narrativeString);

    return SEE.util.xml.ExtractTextFromSectionNode(htmlTransformer.execute(docNode, narrativeString));
};

//TODO: should this be converting to person info
SEE.util.convertUserToAuthor = function (user) {
    var author = new SEE.model.dto.Author();

    author.FirstName(user.PersonInfo.FirstName);
    author.LastName(user.PersonInfo.LastName);
    author.UserName(user.UserName);

    return author;
};

/*SEE.util.authorInfo = function (user) {
    var person = new SEE.model.dto.PersonInfo();

    person.FirstName(user.FirstName);
    person.LastName(user.LastName);
    person.Phone(user.Phone);
    if (user.Identifiers && _.isArray(user.Identifiers) && user.Identifiers.length > 0) {
        person.Identifiers()[0].Root(user.Identifiers[0].Root);
        person.Identifiers()[0].Extension(user.Identifiers[0].Extension);
    } else {
        if (user.Identifiers && _.isArray(user.Identifiers) && user.Identifiers.length === 0) {
            person.Identifiers().push(new SEE.model.dto.InstanceIdentifier());
            person.Identifiers()[0].Root(user.Identifiers[0].Root);
            person.Identifiers()[0].Extension(user.Identifiers[0].Extension);
        }
    }

    return person;
};
*/

SEE.util.displayAuthorToolTip = function(author, html) {
    var theAuthor = author;

    if (typeof author === "function") {
        theAuthor = author();
    }

    if (html) {
        return "<b>Author:</b> " + theAuthor.FirstName() + " " + theAuthor.LastName();
    }

    return "Author: " + theAuthor.FirstName() + " " + theAuthor.LastName();
};

SEE.util.IsPersonInfoEmpty = function(personInfo) {
    if (personInfo.FirstName() != null && personInfo.FirstName() != '') {
        return false;
    }

    if (personInfo.LastName() != null && personInfo.LastName() != '') {
        return false;
        }

    return true;
}

SEE.util.formatPersonInfo = function(diagnoser) {
    var theDiagnoser = diagnoser;

    if (typeof diagnoser == "function") {
        theDiagnoser = diagnoser();
    }

    var name = "";

    if (theDiagnoser.FirstName() != null && theDiagnoser.FirstName() != '') {
        name += theDiagnoser.FirstName();
    }

    if (theDiagnoser.LastName() != null && theDiagnoser.LastName() != '') {
        if (name != "") {
            name += " ";
        }

        name += theDiagnoser.LastName();
    }

    if (name == "") {
        return "Not Set";
    }

    return name;
};

SEE.util.GetSeverityName = function(val) {
    var theVal = val;

    if (typeof val === "function") {
        theVal = val();
    }

    if (theVal == "255604002") {
        return "Mild";
    } else if (theVal == "371923003") {
        return "Mild to moderate";
    } else if (theVal == "6736007") {
        return "Moderate";
    } else if (theVal == "371924009") {
        return "Moderate to severe";
    } else if (theVal == "24484000") {
        return "Severe";
    } else if (theVal == "399166001") {
        return "Fatal";
    }

    return "";
};

SEE.util.GetFormattedDate = function(theDate) {
    return $.datepicker.formatDate("mm/dd/yy" , theDate);

    /*
    var day =   theDate.getUTCDate();

    if (theDate.getDay() + 1 < 10) {
        day = "0" + day;
    }

    var month =  theDate.getUTCMonth() + 1;

    if (theDate.getMonth() + 1 < 10) {
        month = "0" + month;
    }

    var dateFormat = month + "/" + day + "/" + theDate.getUTCFullYear();

    return dateFormat;
    */
};

SEE.util.GetFormattedTime = function(time){
    return $.datepicker.formatTime("hh:mm tt", {hour: time.getHours(), minute: time.getMinutes(), seconds:time.getSeconds()}, {});
}

SEE.util.GetFormattedDateTime = function (d) {

    return (SEE.util.GetFormattedDate(d) + " " + SEE.util.GetFormattedTime(d));
};

SEE.util.Sorter = function(){

    var sorter = {};

    sorter.orderBy = ko.observable("");
    sorter.reverse = ko.observable(false);

    sorter.sort = function(list, orderBy, sortFunction){


        if (orderBy != sorter.orderBy()){
            sorter.orderBy(orderBy);
            sorter.reverse(false);
        }
        else{
            sorter.reverse(!sorter.reverse());
        }

        list.sort(sortFunction);
    };

    sorter.personSorter = function (l, r) {

        var lname = l[sorter.orderBy()]().FirstName().toLowerCase() + l[sorter.orderBy()]().LastName().toLowerCase(),
            rname = r[sorter.orderBy()]().FirstName().toLowerCase() + r[sorter.orderBy()]().LastName().toLowerCase();
        var direction = (sorter.reverse() ? -1 : 1)

        if (lname === rname) {
            return 0;
        } else if (lname < rname) {
            return -1 * direction;
        } else if (lname > rname) {
            return 1 * direction
        }
        return -1;
    };

    sorter.textSorter = function (l, r) {
        var lname = l[sorter.orderBy()]().toLowerCase(),
            rname = r[sorter.orderBy()]().toLowerCase();

        var direction = (sorter.reverse() ? -1 : 1)

        if (lname === rname) {
            return 0;
        } else if (lname < rname) {
            return -1 * direction;
        } else if (lname > rname) {
            return 1 * direction;
        }
    };

    sorter.booleanSorter = function (l, r) {
        var lname = l[sorter.orderBy()](),
            rname = r[sorter.orderBy()]();

        var direction = (sorter.reverse() ? -1 : 1)

        if (lname === rname) {
            return 0;
        } else if (lname && !rname) {
            return -1 * direction;
        } else if (!lname && rname) {
            return 1 * direction;
        }
    };

    sorter.numericSorter = function (l, r) {
        var direction = (sorter.reverse() ? -1 : 1)

        if (l[sorter.orderBy()]() === r[sorter.orderBy()]()) {
            return 0;
        } else if (l[sorter.orderBy()]() < r[sorter.orderBy()]()) {
            return 1 * direction;
        } else if (l[sorter.orderBy()]() > r[sorter.orderBy()]()) {
            return -1 * direction;
        }
    };

    sorter.dateSorter = function (l, r) {
        var ld = Date.parse(l[sorter.orderBy()]()), rd = Date.parse(r[sorter.orderBy()]());
        var direction = (sorter.reverse() ? -1 : 1)

        if (ld === rd) {
            return 0;
        } else if (ld < rd) {
            return -1 * direction;
        } else if (ld > rd) {
            return 1 * direction;
        }
    };


    return sorter;
};