
module.exports = function (){
     return function (request, response, next) {

        response.sendError = function(message){
            response.send(500, message);
        };

         response.missingParameters = function(parameters){
            response.send(400, "The request was missing required parameters, which should be included in the message body: " + parameters);
        };

        next();
    };
};