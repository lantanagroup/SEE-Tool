SEE.namespace("SEE.model");

SEE.model.SmokingStatusItem = function(code, displayName){
    this.Code = code;
    this.DisplayName = displayName;
};

SEE.model.SmokingStatusList = [
    new SEE.model.SmokingStatusItem("", ""),
    new SEE.model.SmokingStatusItem("449868002", "Current every day smoker."),
    new SEE.model.SmokingStatusItem("428041000124106", "Current some day smoker."),
    new SEE.model.SmokingStatusItem("8517006", "Former smoker."),
    new SEE.model.SmokingStatusItem("266919005", "Never smoker."),
    new SEE.model.SmokingStatusItem("77176002", "Smoker, current status unknown."),
    new SEE.model.SmokingStatusItem("266927001", "Unknown if ever smoked."),
    new SEE.model.SmokingStatusItem("428071000124103", "Heavy tobacco smoker."),
    new SEE.model.SmokingStatusItem("428061000124105", "Light tobacco smoker.")
];