var config = require('config').Settings;
var fileSystem = require('fs');
var log = require('npmlog');

log.info("Importing documents in drop folder.");

var files = fileSystem.readdirSync(config.fileLoadLocation);

if (files.length === 0) {
    log.info("No files to import");
}
else{
    var _ = require('underscore');

    var etl = require("./drop/etl.js").create();

    log.info("found " + files.length + " document(s).")

    var userStore = require("./Store/UserStore.js").create(function() {
        userStore.getUserByUserName("angelo.kastroulis", function(error, user){

            var documentStore = require("./Store/DocumentStore.js").create(function() {
                _.each(files, function (f) {
                    etl.ProcessFile(config.fileLoadLocation, f, config.fileProcessedLoadLocation, config.fileProcessedErrorLocation, documentStore, user.GroupIdentifier, function (error) {
                        if (error) {
                            log.error("There was an error processing the located file.", error);
                        }
                        log.info("File Processed", f);

                    });
                });

                //a larger refactor would allow us to close the connection automatically after all files are processed... but, as it is, the user must stop
                //from the command prompt
                //documentStore.db.close();
            });
        });

    });


}
