SEE.namespace("SEE.model");

SEE.model.SeverityItem = function(code, displayName){
    this.Code = code;
    this.DisplayName = displayName;
};

SEE.model.SeverityList =  [
    new SEE.model.SeverityItem("", ""),
    new SEE.model.SeverityItem("255604002", "Mild"),
    new SEE.model.SeverityItem("371923003", "Mild to moderate"),
    new SEE.model.SeverityItem("6736007", "Moderate"),
    new SEE.model.SeverityItem("371924009", "Moderate to severe"),
    new SEE.model.SeverityItem("24484000", "Severe"),
    new SEE.model.SeverityItem("399166001", "Fatal"),
];