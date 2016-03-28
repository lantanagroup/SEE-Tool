/// <reference path="../../js/lib/external/underscore/underscore.js" />
beforeEach(function() {
    this.addMatchers({
        toBePlaying: function(expectedSong) {
            var player = this.actual;
            return player.currentlyPlayingSong === expectedSong && 
                   player.isPlaying;
        },

        toBeValidCDA: function () {
            //TODO: run a CDA validator
            return !_.isUndefined(this.actual) && !_.isNull(this.actual);
        },

        toBeSomething: function () {
            return !_.isUndefined(this.actual) && !_.isNull(this.actual);
        },

        toBeArrayWithAtLeastOneElement: function () {
            return (_.isArray(this.actual)) && (this.actual.length > 0);
        },

        isDefined: function() {
            return !(_.isUndefined(this.actual));
        },

        isNotDefined: function () {
            return (_.isUndefined(this.actual));
        }
    });
});
