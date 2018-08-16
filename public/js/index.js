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

function SearchinIndex(){
	console.log(document.getElementById("select").value);
	let key = document.getElementById("select").value;
	let value = document.getElementById("search").value;
	console.log(key);
	console.log(value);
	let a = document.createElement("a");
	a.href = "http://127.0.0.1:8081/users?key="+key+"&value="+value;
	document.body.appendChild(a);
	a.click();
}