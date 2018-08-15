function uploadfile(){
	var socket = io.connect();
	var sessionKey = JSON.parse(localStorage.getItem("sessionKey"));
	sessionKey = new Uint8Array(sessionKey);
	var file = $('input[name="stream"]')[0].files[0];
	var fileReader = new FileReader();
	var chunksize= 1024*1024;
	
	slice = file.slice(0, chunksize);
	var total_slice=Math.ceil(file.size/chunksize);
	console.log("total "+total_slice);
	var timestamp=new Date().getTime();
	console.log("timestamp: "+timestamp);
	
	fileReader.readAsArrayBuffer(slice); 
	fileReader.onload = (evt) => {
		var arrayBuffer = fileReader.result; 
		var plaintext = new Uint8Array(arrayBuffer);
		var enc = PFCCTR_Encrypt(plaintext,sessionKey,sessionKey.slice());
		socket.emit('slice upload', { 
			name: file.name, 
			type: file.type, 
			size: file.size, 
			timestamp: timestamp,
			data: UTILS_IntArrayToArrayBuffer(enc),
			id: localStorage.getItem("userID")
		}); 			
	}	
	socket.on('request slice upload', (data) => {
		console.log("cur "+data.currentSlice);
		
		var place = data.currentSlice * chunksize, 
		slice = file.slice(place, place + Math.min(chunksize, file.size - place));
		
		updateProgressBar(data.currentSlice,total_slice);
			
		fileReader.readAsArrayBuffer(slice); 
	});
	socket.on('end upload', (data) => {
		updateProgressBar(total_slice,total_slice);
		console.log('end upload');
		socket.emit('end');
	});
	socket.on('error occur', (data) => {
		socket.emit('error end');
		alert('error occur');
	});
}
function updateProgressBar(cur,total){
	let elem = document.getElementById("myBar");   
	let width = Math.ceil((cur/total)*100);
	elem.style.width = width + '%';
	elem.innerHTML = width * 1 + '%';
}