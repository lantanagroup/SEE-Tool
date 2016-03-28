/// <reference path="../../external/knockout/knockout-2.1.0.js" />
/// <reference path="../../external/underscore/underscore.js" />
SEE.namespace("SEE.model");

SEE.model.BaseModel = function () {
    //everything should go in init
};

SEE.model.BaseModel.prototype.init = function () {
    this.BackupSet = {
        backupData: null,
        backup: null
    };
};


SEE.model.BaseModel.prototype.Commit = function () {
    this.BackupSet.backupData = this.toJS();
    this.BackupSet.backup = null;
};

SEE.model.BaseModel.prototype.GetBackup = function () {
    if (!this.BackupSet.backup) {
        this.BackupSet.backup = new this.constructor();
        this.BackupSet.backup.fromJS(this.BackupSet.backupData);
    }

    return this.BackupSet.backup;
};


SEE.model.BaseModel.prototype.GetBackupData = function () {
    return this.BackupSet.backupData;
};

SEE.model.BaseModel.prototype.HasChanges = function () {
    var backup = this.GetBackupData();
    var actual = this.toJS();
    
    return SEE.model.BaseModel.recurseHasChanges(backup, actual);
};

SEE.model.BaseModel.recurseHasChanges = function (backup, actual) {
    var i, backupNode, actualNode, type, ignored = [];

    if (typeof backup !== typeof actual) {
        return true;
    }

    if (typeof backup !== 'object') {
        return backup !== actual;
    }

    for (i in backup) {
        if (_.contains(ignored, i)) {
            continue;
        }

        backupNode = backup[i];
        actualNode = actual[i];

        //skip functions
        if (!_.isFunction(backupNode)) {
            if (Object.prototype.toString.call(backupNode) === '[object Date]') {
                if (backupNode != actualNode) {
                    return true;
                }
            } else if (backupNode && typeof backupNode === 'object') { //this gets both arrays and objects
                if (backupNode instanceof Array) {
                    if (backupNode.length !== actualNode.length) { //deal with arrays
                        return true;
                    }

                    var backupArray = backupNode,
                        actualArray = actualNode,
                        s = backupArray.length;

                    while (s--) {
                        if (SEE.model.BaseModel.recurseHasChanges(backupArray[s], actualArray[s])) {
                            return true;
                        }
                    }
                } else if (backupNode && actualNode) {
                    if (SEE.model.BaseModel.recurseHasChanges(backupNode, actualNode)) {
                        return true;
                    }
                }
            }
            else {
                if (backupNode !== actualNode) {
                    var backupNodeNullOrEmpty = !backupNode || backupNode === '';
                    var actualNodeNullOrEmpty = !actualNode || actualNode === '';

                    return !(backupNodeNullOrEmpty && actualNodeNullOrEmpty);
                }
            }
        }
    }

    return false;

};

SEE.model.BaseModel.prototype.getMapping = function () {
    var mapping = this.Map || {};
    if (this._SEE_Type && SEE.model.dto.map[this._SEE_Type]) {
        mapping["include"] = SEE.model.dto.map[this._SEE_Type]["include"];
    }    

    return mapping;
}

SEE.model.BaseModel.prototype.fromJS = function (data, mapping) {
    if (!mapping) {
        mapping = this.getMapping();
    }
    if (mapping && mapping.ignore) {
        mapping.ignore.push('hasError');
        mapping.ignore.push('BackupSet');
        mapping.ignore.push('IsEmpty');
        mapping.ignore.push('FullName');
    } else {
        mapping.ignore = ['hasError', 'BackupSet', 'IsEmpty', 'FullName'];
    }

    var dateTimeRegEx = new RegExp("\\d\\d\\d\\d-\\d\\d-\\d\\dT\\d\\d:\\d\\d:\\d\\d.\\d\\d\\dZ");

    for (p in this) {

        //if (this[p] == null) {continue;}

        //var prop = ko.utils.unwrapObservable(this[p]);

        if(typeof data[p] != "undefined"){

            if (dateTimeRegEx.test(data[p])) {
                if (Date.parse(data[p]) !== NaN) {
                    data[p] = new Date(data[p]);
                }
            }
        }
       /*
        if (_.isDate(prop) && _.isString(data[p])) {
            if (Date.parse(data[p]) !== NaN) {
                data[p] = new Date(data[p]);
            }
        }
        */

    }

    ko.mapping.fromJS(data, mapping, this);

    this.Commit();
};

SEE.model.BaseModel.prototype.toJS = function () {
    var mapping = this.getMapping();
    if (mapping && mapping.ignore) {
        mapping.ignore.push('hasError');
        mapping.ignore.push('BackupSet');
        mapping.ignore.push('IsEmpty');
        mapping.ignore.push('FullName');
    } else {
        mapping.ignore = ['hasError', 'BackupSet', 'IsEmpty', 'FullName'];
    }

    var js = ko.mapping.toJS(this, mapping), prop;

    for (p in this) {
        prop = ko.utils.unwrapObservable(this[p]);
        if (prop instanceof SEE.model.BaseModel) {
            js[p] = prop.toJS();
        }
    }

    if (js["Map"]) {
        delete js["Map"];
    }

    if (js["hasError"]) {
        delete js["hasError"];
    }

    return js;
};
