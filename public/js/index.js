function SearchinIndex(){
	let key = document.getElementById("select").value;
	let value = document.getElementById("search").value;
	let a = document.createElement("a");
	a.href = "/users?key="+key+"&value="+value;
	a.click();
}