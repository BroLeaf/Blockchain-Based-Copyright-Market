var crypt = require('./usage');
var fs = require("fs");
module.exports={
	sock_recv : function(socket){
		var sessionKey = JSON.parse(socket.handshake.session.sk);
		sessionKey = new Uint8Array(sessionKey);

		var files = {}, 
		struct = { 
			name: null, 
			type: null, 
			size: 0, 
			data: [], 
			slice: 0, 
		};
		
		socket.on('slice upload', (data) => { 
			
			if (!files[data.name]) { 
				files[data.name] = Object.assign({}, struct, data); 
				files[data.name].data = []; 
			}
			var tmp=JSON.parse(crypt.HELPER_DecryptString(data.data,sessionKey));
			var recv = new Buffer(tmp.data); 
			//save the data 
			files[data.name].data.push(recv);
			files[data.name].slice++;
			
			if (files[data.name].slice * 100000 >= files[data.name].size) {
				console.log(data.name);
				var fileBuffer = Buffer.concat(files[data.name].data); 
				fs.writeFile(__dirname +'/../data/storage/'+data.name, fileBuffer, (err) => { 
					delete files[data.name]; 
					if (err) 
					{
						console.log(err);
						return socket.emit('upload error');
					}
					console.log("fwrite finish");
					socket.emit('end upload');
				});
			} else { 
				socket.emit('request slice upload', { 
					currentSlice: files[data.name].slice 
				}); 
			}
		});
		socket.on('end', function(){
			console.log("socket end");
			socket.disconnect(0);
		})
	}
};