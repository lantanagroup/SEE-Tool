/// <reference path="lib/internal/enum/enum.js" />
//setup crossroads
crossroads.addRoute('/',
    function () {
        SEE.session.ViewModelDispatch.Dispatch(SEE.viewmodel.DocumentListViewModel);
    });

crossroads.addRoute('document/{id}',
    function (id) {
        SEE.session.ViewModelDispatch.Dispatch(SEE.viewmodel.DocumentViewModel, id);
    });

crossroads.addRoute('upload',
    function (id) {
        SEE.session.ViewModelDispatch.Dispatch(SEE.viewmodel.UploadViewModel);
    });

/*
if (typeof console != 'undefined') {
    crossroads.routed.add(console.log, console); //log all routes
}
*/
//setup hasher
function parseHash(newHash, oldHash) {
    crossroads.parse(newHash);
}
hasher.initialized.add(parseHash); //parse initial hash
hasher.changed.add(parseHash); //parse hash changes
hasher.init(); //start listening for history change

