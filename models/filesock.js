var pfcctr=require('./PFCCTR');
var crypt = require('./usage');
var fs = require("fs");
module.exports={
	sock_recv : function(socket, loginObj, uploadDB, localDB){
		
		var sessionKey = JSON.parse(socket.handshake.session.sk);
		sessionKey = new Uint8Array(sessionKey);
		
		var files = {}, 
		struct = { 
			name: null, 
			type: null, 
			size: 0,
			data: [],
			slice: 0 
		};
		
		var path,name;
		var t1,t2;
		socket.on('slice upload', (data) => { 
			var dec = pfcctr.PFCCTR_Decrypt(new Uint8Array(data.data),sessionKey,sessionKey.slice());			
			var dir = __dirname+"/../data/tmpFile/"+data.id;
			var filename = data.timestamp+"_"+data.name;
			path=dir+"/"+filename;
			author = data.id;
			
			if (!fs.existsSync(dir)){
				fs.mkdirSync(dir);
			}				
			if (!files[filename]) { 
				files[filename] = Object.assign({}, struct, data);
				files[filename].data=[];
				t1=new Date().getTime();
			}
			
			var filechunk = new Buffer(dec);
			files[filename].data.push(filechunk);
			files[filename].slice++;
			
			if (files[filename].slice*1024*1024 >= files[filename].size) {
				var fileBuffer = Buffer.concat(files[filename].data); 
				fs.writeFile(path, fileBuffer, (err) => { 
					delete files[filename]; 
					if (err){
						console.log(err);
						return socket.emit('upload error');
					}
					name=data.name;
					t2=new Date().getTime();
					socket.emit('end upload');
				});
			} else { 
				socket.emit('request slice upload', { 
					currentSlice: files[filename].slice 
				}); 
			}
		});
		socket.on('end', function (){
			console.log("[total time]: "+(t2-t1));
			console.log("socket end");
			socket.disconnect(0);
			
			let keyword = uploadDB.getKeyword();
			// localDB.dbinsert(name, author, 2018, keyword);
			uploadDB._uploadFile(loginObj,path,name);
		});
	}
};