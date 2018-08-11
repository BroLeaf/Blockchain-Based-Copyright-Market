function uploadfile(){
    var socket = io.connect();
    var sessionKey = JSON.parse(localStorage.getItem("sessionKey"));
    sessionKey = new Uint8Array(sessionKey);
    var file = $('input[name="stream"]')[0].files[0];
    var fileReader = new FileReader(), 
    slice = file.slice(0, 100000);
    var total_slice=Math.ceil(file.size/100000);
    console.log("total "+total_slice);
    var timestamp=new Date().getTime();
    console.log("timestamp: "+timestamp);
    
    fileReader.readAsArrayBuffer(slice); 
    fileReader.onload = (evt) => {
        var arrayBuffer = fileReader.result; 
        var data={
            data:Array.apply(null, new Uint8Array(arrayBuffer)),
            id:localStorage.getItem("userID")
        };
        socket.emit('slice upload', { 
            name: file.name, 
            type: file.type, 
            size: file.size, 
            timestamp:timestamp,
            data:HELPER_GenerateEncryptedRequest(data, sessionKey)   
        }); 			
    }	
    socket.on('request slice upload', (data) => {
        console.log("cur "+data.currentSlice);
        
        var place = data.currentSlice * 100000, 
            slice = file.slice(place, place + Math.min(100000, file.size - place)); 
        
        updateProgressBar(data.currentSlice,total_slice);
        fileReader.readAsArrayBuffer(slice); 
    });
    socket.on('end upload', (data) => {
            
        console.log('end upload');
        updateProgressBar(total_slice,total_slice);
        socket.emit('end');
    });
}

function updateProgressBar(cur,total){
	let elem = document.getElementById("myBar");   
	let width = Math.ceil((cur/total)*100);
	elem.style.width = width + '%';
	elem.innerHTML = width * 1 + '%';
}