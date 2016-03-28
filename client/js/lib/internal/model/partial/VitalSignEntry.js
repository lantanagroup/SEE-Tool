/// <reference path="../../../external/underscore/underscore.js" />
SEE.namespace("SEE.model.dto");
SEE.model.dto.VitalSignEntry.prototype.init = function () {
    SEE.model.BaseModel.prototype.init.call(this);

    var self = this;

    //this.CombinedBP = ko.computed(function () {
    //    var s = '';

    //    if (!_.isUndefined(self.SystolicBP())) {
    //        s = self.SystolicBP();
    //    }

    //    s += "/";

    //    if (!_.isUndefined(self.DiastolicBP())) {
    //        s += self.DiastolicBP();
    //    }

    //    return s;
    //});

    self.HeightKeyup = function (sender, event) {
        var input = event.currentTarget.value;

        this.DoCalculateHeight(input);

        return true;
    }

    self.DoCalculateHeight = function(input)
    {
        if (input.match(/^[a-zA-Z]+$/))
            return;

        //has ' and inches
        if (input.indexOf("'") != -1) {

            var tmp = input.replace('"', '');
            tmp = tmp.replace("'", '-');
            tmp = tmp.replace(" ", '');

            var ft_in = tmp.split("-");

            var total_inches = ft_in[0] * 12 + ft_in[1] * 1;

            if (!isNaN(total_inches)) {
                this.Height(total_inches.toString());
                this.HeightUnit("in");
            }
        }
        else {
            this.Height(input);
        }
    }

    self.DoCalculateBMI = function() {
        if (self.Height() == "" || self.Weight() == "") { return;}

        var height = parseFloat(self.Height());
        var weight = parseFloat(self.Weight());

        //convert to metric
        if (self.HeightUnit() == "in") {
            height *= 2.54; //2.54 cm per inch
            //height = height * 0.393701;
        }

        if (self.WeightUnit() == "lb") {
            weight *= .453592; //2.2lbs per kg
            //weight = weight / 0.453592;
        }

        var bmi = (weight / Math.pow(height/100, 2));
       /*
        if (self.HeightUnit() == "in") {
            bmi *= 703;
        }
         */
        bmi = Math.round(bmi*10)/10;
        self.BMI(bmi);
    };

};
