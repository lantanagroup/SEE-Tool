iframeLoaded = function (bodyWriter) {
    var contents = SEE.session.MainVM.DequeueIFrameBody();
    bodyWriter.setHtml(contents);
}

var login = function (userId, passWord, callback) {
    var service = SEE.service.DocumentService;

    service.Login(userId, passWord, function (user) {
        if (user) {
            SEE.session.SetUser(user);

            service.GetOrganizationForUser(user, function (organization) {
                SEE.session.Organization = organization;

                $('#UserNameLabel')[0].innerText = "[" + SEE.session.UserFullName() + "]";
                SEE.session.MainVM.CloseAllDocumentTabs();
                SEE.session.MainVM.PageVM().Load();

                callback();
            });
        } else {
            bootbox.alert('Invalid login attempt');
        }
    });
};

var showUserDialog = function(){
    SEE.session.MainVM.Modal.Show(new SEE.viewmodel.modal.UserInfoViewModel(), SEE.session.User, function(user){
        //do save
        SEE.service.DocumentService.UpdateUser(user, function(){
            //update session user
            SEE.session.User = user;
        });
    });
};

$(document).ready(function () {
    $.ajaxPrefilter(function(options, originalOptions, jqXHR) {
        var token;
        if (!options.crossDomain) {
            token = $("meta[name='csrf-token']").attr('content');
            if (token) {
                return jqXHR.setRequestHeader('X-CSRF-Token', token);
            }
        }
    });

    /*
    var regex = new RegExp("[\\?&]userId=([^&#]*)");
    var userId = regex.exec(location.search);
    userId = (userId == null ? "" : decodeURIComponent(userId[1].replace(/\+/g, " ")));
    */

    //bind the main viewmodel to the menu section (the main view area binds to the SEE.session.MainVM.PageVM)
    login('', '', function () {
        //var u = SEE.session.User;

        var u = new SEE.model.dto.User();

        if (!_.isNull(SEE.session.User)) {
            u.fromJS.call(u, SEE.session.User);
        }

        if (u.PersonInfo.hasError()){
            showUserDialog();
        }
        // ko.applyBindings(SEE.session.MainVM, document.getElementById("MainBinding"));
    });

    ko.applyBindings(SEE.session.MainVM, document.getElementById("MainBinding"));

    $('#myProfileLink').click(function () {
        showUserDialog();
    });

    $('#myOrganizationLink').click(function () {
        SEE.session.MainVM.Modal.Show(new SEE.viewmodel.modal.OrganizationInfoViewModel(), SEE.session.Organization, function(org){
            SEE.service.DocumentService.UpdateUser(org, function(){
                SEE.session.Organization = org;
            });
        });
    });

    //globally turn off the animation for bootbox alerts
    bootbox.animate(false);
});

window.onbeforeunload = function () {
    if ($.cookie("see.session")) {
        return "SEE is about to close, and you will be logged out. Are you sure?";
    }
}

$(window).unload(function() {
    if ($.cookie('see.session')) {
        $.removeCookie('see.session', { path: '/' });
    }
});