function gotoCreators() {
    if(window.localStorage.sessionKey == undefined) {
        alert("You need to login first");
        return;
    }
    window.location = '/creators';
}

function gotoUsers() {
    if(window.localStorage.sessionKey == undefined) {
        alert("You need to login first");
        return;
    }
    window.location = '/users';
}

function gotoLogin() {
    window.location = '/login';
}