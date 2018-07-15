function uploadfile(){
    var socket = io.connect();
    var sessionKey = JSON.parse(localStorage.getItem("sessionKey"));
    sessionKey = new Uint8Array(sessionKey);
    var file = $('input[name="stream"]')[0].files[0];
    var fileReader = new FileReader(), 
    slice = file.slice(0, 100000); 
    fileReader.readAsArrayBuffer(slice); 
    fileReader.onload = (evt) => {
        var arrayBuffer = fileReader.result; 
        var data={
            data:Array.apply(null, new Uint8Array(arrayBuffer))
        };
        socket.emit('slice upload', { 
            name: file.name, 
            type: file.type, 
            size: file.size, 
            data:HELPER_GenerateEncryptedRequest(data, sessionKey)   
        }); 			
    }	
    socket.on('request slice upload', (data) => { 
        var place = data.currentSlice * 100000, 
            slice = file.slice(place, place + Math.min(100000, file.size - place)); 
        
        fileReader.readAsArrayBuffer(slice); 
    });
    socket.on('end upload', (data) => {
        console.log('end upload');
        socket.emit('end');
    })
}