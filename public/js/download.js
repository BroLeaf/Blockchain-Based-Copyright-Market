window.requestFileSystem = window.requestFileSystem || window.webkitRequestFileSystem;
function download(){
	let keyword = "No.0";
	$.ajax({
		url: "/users/download?slice=0&keyword=" + keyword,
		type: "GET"
	}).done(function(chunk) {
		let obj = JSON.parse(chunk);
		console.log(obj);
		pushAjaxRequest(1, obj.slice, obj.name, obj.size, keyword);
	});
}
function pushAjaxRequest(cur, slice, filename, size, keyword) {
	console.log(cur);
	
	$.ajax({
		url: "/users/download?slice=" + cur + "&keyword=" + keyword,
		type: "GET",
	}).done(function(chunk) {
		let obj = JSON.parse(chunk);
		let filebuf = obj.filebuf.data;
		let sessionKey = JSON.parse(localStorage.getItem("sessionKey"));
        sessionKey = new Uint8Array(sessionKey);
		let encfile = new Uint8Array(filebuf);
		let decfile = PFCCTR_Decrypt(encfile,sessionKey,sessionKey.slice());
		console.log(obj);
		console.log(filebuf);
		console.log(encfile);
		console.log(decfile);
		
		let blob = new Blob([decfile]);
		console.log(blob);
		window.requestFileSystem(TEMPORARY, 1048567 * 1024, function(fs) {
			fs.root.getFile(filename, {create: true}, function(fileEntry) {

				fileEntry.createWriter(function(fileWriter) {
					if(cur==1)fileWriter.truncate(0);
				}, onFileSystemError);
				
				fileEntry.createWriter(function(fileWriter) {
					fileWriter.onwriteend = function(e) {
						if(cur == slice) {
							console.log("finish");
							let url = fileEntry.toURL();
							let a = document.createElement("a");
							a.href = url;
							a.download = filename;
							document.body.appendChild(a);
							a.click();
						}else if(cur < slice){
							console.log("request");
							pushAjaxRequest(cur+1, slice, filename, size, keyword);
						}
					}
					fileWriter.seek(fileWriter.length);
					fileWriter.write(blob);
				}, onFileSystemError);
			}, onFileSystemError);
		}, onFileSystemError);
	})
	
}
function onFileSystemError(e) {
	console.log("Error: " + e.message);
}