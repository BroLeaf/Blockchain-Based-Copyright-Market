function gotoCreators() {
    if(window.localStorage.sessionKey == undefined) {
        alert("You need to login first");
        return;
    }
    window.location = '/creators';
/*	$.ajax({
		url: "/creators",
		type: "GET"
	}).done(function(chunk) {
		console.log(chunk);
		if(chunk=="unlogin")
			alert("unlogin");
		else{
			window.location = '/creators';
			//$("html").html(chunk);
			//$('#output_code').text(chunk);
		}
		let obj = JSON.parse(chunk);
		console.log(obj);
		pushAjaxRequest(1, obj.slice, obj.name, obj.size, keyword);
	});
*/
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