var fs = require("fs");
var util=require('./Utility');
var crypto = require('crypto');
var http = require('http');
var Q = require('q');
var querystring = require('querystring');
var pfcctr=require('./PFCCTR');
var crypt = require('./usage');
var FormData = require('form-data');
var cookie=null;
var db_datas=0;
module.exports={
	getCookie : function(){
		return cookie;
	},
	
	getKeyword : function() {
		return "No." + db_datas;
	},
	
	SHA256_bytes : function(data){
		var hash = crypto.createHash('sha256');
		hash.update(data);
		return hash.digest();
	},
	
	SHA256_hex : function(data){
		var hash = crypto.createHash('sha256');
		hash.update(data);
		return hash.digest('hex');
	},
	
	EKD_array_xor : function (a, b){
		var tmp = new Uint8Array(32);
		for (var i = 0; i < 32; ++i) {
			tmp[i] = a[i] ^ b[i];
		}
		return tmp;
	},
	
	EKD_Random_byte : function (){
		return Math.floor(Math.random()*256);
	},
	
	EKD_Random_int_array : function (length){
		var tmp = new Uint8Array(length);
		for (var i = 0; i < length; ++i) {
			tmp[i] = module.exports.EKD_Random_byte();
		}
		return tmp;
	},
	
	array_xor : function (a, b){
		var len = Math.min(a.length, b.length);
		var tmp = new Array(len);
		for (var i = 0; i < len; i++) {
			tmp[i] = a[i] ^ b[i];
		}
		return tmp;
	},
	generateCard : function (profile) {
		var	hex_pw = util.UTILS_StringToHexString("1");
		var key = module.exports.SHA256_bytes(util.UTILS_HexStringToIntArray(profile.IDc.concat(hex_pw)));
		
		Kp = util.UTILS_IntArrayToHexString(module.exports.array_xor(util.UTILS_HexStringToIntArray(profile.Kp), key));
		Ksign = util.UTILS_IntArrayToHexString(module.exports.array_xor(util.UTILS_HexStringToIntArray(profile.Ksign), key));
		TS = util.UTILS_IntArrayToHexString(module.exports.array_xor(util.UTILS_HexStringToIntArray(profile.TS), key));
		TK = util.UTILS_IntArrayToHexString(module.exports.array_xor(util.UTILS_HexStringToIntArray(profile.TK), key));
		EID = util.UTILS_IntArrayToHexString(module.exports.array_xor(util.UTILS_HexStringToIntArray(profile.EID), key));
		EK = util.UTILS_IntArrayToHexString(module.exports.array_xor(util.UTILS_HexStringToIntArray(profile.EK), key));
		
		var newprofile=profile.IDc.concat("\n", Kp, "\n", Ksign, "\n", TS, "\n", TK, "\n\n", EID, "\n", EK, "\n");
		var dfd = Q.defer();
		fs.writeFile('./data/makaDB.card', newprofile,'utf8',(err) => {
			if (err)
			dfd.reject('[Server error] generateCard fail');
			dfd.resolve('new card success!!');
		});
		return dfd.promise;
	},
	
	updateCard : function (profile, ts, tk) {
		profile.TS = ts;
		profile.TK = tk;
		return profile;
	},
	
	loadcard : function(){
		var result = [];
		var dfd = Q.defer();
		fs.readFile('./data/makaDB.card', 'utf8',(err, data) => {
			if (err) throw err;			
			
			//console.log(data);
			var lines = data.split("\n");
			var IDc = lines[0].substring(0, 64);
			var Kp = lines[1].substring(0, 32);
			var Ksign = lines[2].substring(0, 32);
			var TS = lines[3].substring(0, 64);
			var TK = lines[4].substring(0, 64);
			var EID = lines[6].substring(0, 64);
			var EK = lines[7].substring(0, 64);
			//makaDB.card's pwd="1"
			var hex_pw = util.UTILS_StringToHexString("1");
			var key = new Uint8Array(module.exports.SHA256_bytes(util.UTILS_HexStringToIntArray(IDc.concat(hex_pw))));
			
			result.IDc = IDc;
			result.Kp = util.UTILS_IntArrayToHexString(module.exports.array_xor(util.UTILS_HexStringToIntArray(Kp),key));
			result.Ksign = util.UTILS_IntArrayToHexString(module.exports.array_xor(util.UTILS_HexStringToIntArray(Ksign),key));
			result.TS = util.UTILS_IntArrayToHexString(module.exports.array_xor(util.UTILS_HexStringToIntArray(TS),key));
			result.TK = util.UTILS_IntArrayToHexString(module.exports.array_xor(util.UTILS_HexStringToIntArray(TK),key));
			result.EID = util.UTILS_IntArrayToHexString(module.exports.array_xor(util.UTILS_HexStringToIntArray(EID),key));
			result.EK = util.UTILS_IntArrayToHexString(module.exports.array_xor(util.UTILS_HexStringToIntArray(EK),key));
			dfd.resolve(result);
		});
		return dfd.promise;
	},
	ekd : function(makaURL, IDc, TSc, TKc, CALLBACK){
		
		IDc = util.UTILS_HexStringToIntArray(IDc);
		TSc = util.UTILS_HexStringToIntArray(TSc);
		TKc = util.UTILS_HexStringToIntArray(TKc);
		var Nc = module.exports.EKD_Random_int_array(32);
		var Nx = module.exports.EKD_array_xor(TKc, Nc);
		var conc = util.UTILS_ConcatIntArray(IDc, TKc, Nc, TSc);
		var AIDc = module.exports.SHA256_hex(conc);
		
		//$.post()
		var makainfo=querystring.stringify({"aidc": AIDc, 
			"nx": util.UTILS_IntArrayToHexString(Nx), 
		"tsc": util.UTILS_IntArrayToHexString(TSc)});
		//console.log(makainfo);
		var options = {
			host: '140.116.247.10',
			port: 80,
			path: makaURL,
			method: 'POST',
			headers: {
				'Content-Type': 'application/x-www-form-urlencoded',
				'Content-Length': Buffer.byteLength(makainfo),
				'Cookie': cookie 
			}
		};
		var httpreq = http.request(options, function (response) {
			//console.log(response.headers);
			if(response.headers["set-cookie"]){
				cookie=(response.headers["set-cookie"])[0];
				//console.log("header: "+(response.headers["set-cookie"])[0]);
			}
			response.setEncoding('utf8');
			response.on('data', function (data) {
				
				var obj = JSON.parse(data);
				//console.log(obj);
				var IDs = util.UTILS_HexStringToIntArray(obj.IDs);
				var Nx2 = util.UTILS_HexStringToIntArray(obj.Nx);
				var TS  = util.UTILS_HexStringToIntArray(obj.TS);
				var V4  = util.UTILS_HexStringToIntArray(obj.V4);
				var V42 = module.exports.SHA256_bytes(util.UTILS_ConcatIntArray(Nx2, Nc, TS, TKc, IDs));
				
				if(pfcctr.PFCCTR_ArraysIdentical(V4,V42) == false){
					CALLBACK([], [], []);
					return;
				}
				
				var SK      = module.exports.EKD_array_xor(Nx2, module.exports.SHA256_bytes(util.UTILS_ConcatIntArray(TKc, IDc, TSc)));
				var TSc_new = module.exports.EKD_array_xor(TS,  module.exports.SHA256_bytes(util.UTILS_ConcatIntArray(TKc, IDc, Nc)));
				var TKc_new = module.exports.SHA256_bytes(util.UTILS_ConcatIntArray(TKc, IDc, TSc_new));
				
				CALLBACK(util.UTILS_IntArrayToHexString(SK), util.UTILS_IntArrayToHexString(TSc_new), util.UTILS_IntArrayToHexString(TKc_new));
			});
		});
		httpreq.write(makainfo);
		httpreq.end();
	},
	_makaWithProxy : function(loginObj){
		var dfd = Q.defer();
		module.exports.ekd("/storage/maka.jsp", loginObj.profile.IDc,loginObj.profile.TS, loginObj.profile.TK, function(psk, pts, ptk) {
			if (psk.length == 0) {
                dfd.reject("[Server error] maka With Proxy fail");
                return;
			}
			loginObj.proxySk = util.UTILS_HexStringToIntArray(psk.substring(0, 32));
			loginObj.profile = module.exports.updateCard(loginObj.profile, pts, ptk);
            dfd.resolve("SUCCESS1");
		});
		return dfd.promise;
	},
	_makaWithServer : function(loginObj){
		var dfd = Q.defer();
		module.exports.ekd("/storage/Server/maka.jsp", loginObj.profile.IDc,loginObj.profile.TS, loginObj.profile.TK, function(ssk, sts, stk) {
			if (ssk.length == 0) {
                dfd.reject("[Server error] maka With Server fail");
                return;
			}			
			loginObj.serverSk = util.UTILS_HexStringToIntArray(ssk.substring(0, 32));
			loginObj.profile = module.exports.updateCard(loginObj.profile, sts, stk);
            dfd.resolve("SUCCESS2");
		});
		return dfd.promise;
	},
	_login: function(loginObj) {
        var dfd = Q.defer();
		
        var loginData = util.UTILS_IntArrayToHexString(
		pfcctr.PFCCTR_Encrypt(util.UTILS_StringToIntArray(loginObj.profile.IDc), loginObj.proxySk, loginObj.proxySk.slice()));
		
		var logininfo=querystring.stringify({
            data: loginData
		});
		//console.log(loginData);
		//console.log(logininfo);
		
		var options = {
			host: '140.116.247.10',
			port: 80,
			path: "/storage/login.jsp",
			method: 'POST',
			headers: {
				'Content-Type': 'application/x-www-form-urlencoded',
				'Content-Length': Buffer.byteLength(logininfo),
				'Cookie': cookie
			}
		};
		var httpreq = http.request(options, function (response) {
			response.setEncoding('utf8');
			response.on('data', function (data) {
				//console.log("login= "+data);
				var json = JSON.parse(crypt.HELPER_DecryptString(data.trim(), loginObj.proxySk));
				if (json.result) {
					loginObj.keywordKey = util.UTILS_HexStringToIntArray(json.keywordKey);
					//console.log(json);
					dfd.resolve("SUCCESS3");
				}else dfd.reject("[Server error] login fail");
			})
		});
		httpreq.write(logininfo);
		httpreq.end();
		return dfd.promise;
	},
	_uploadFile: function(loginObj,filePath,filename,keyword) {
		function keywordsToHexString (input,keywordKey) {			
			var result = [];
			var splitted = input.replace(/\s+/g, " ").split(" ");
			for (var i = 0; i < splitted.length; ++i) {	
				result.push(util.UTILS_IntArrayToHexString(pfcctr.PFCCTR_Encrypt(util.UTILS_StringToIntArray(splitted[i]), keywordKey,keywordKey.slice())));
			}
			return result.join(",");
		}
		function readLines(input,timestamp,filesize,filename) {
			var CHUNK_SIZE = 1024*1024;
			var fileKey=new Uint8Array(crypto.randomBytes(16));
			var keywordKey=pfcctr.PFCCTR_Decrypt(loginObj.keywordKey,loginObj.userKey,
			loginObj.userKey.slice());
			var totalSlice=Math.ceil(filesize /CHUNK_SIZE);
		
			var keywords=keywordsToHexString(keyword,keywordKey);
			var cur=0;
			var remains=totalSlice;
			input.on('data', function(data) {
				if(cur < totalSlice){
					cur++;
					console.log("cur: "+cur+" totalslice: "+totalSlice);
					var form = new FormData();
					
					var headers = form.getHeaders();
					var uploadHeaders = crypt.HELPER_GenerateEncryptedRequest({
						userID: loginObj.userID,
						timestamp: timestamp,
						parent: '',
						keywords: keywords,
						isDirectory: false,
						fileSize: filesize,
						name: util.UTILS_IntArrayToHexString(
						pfcctr.PFCCTR_Encrypt(
						util.UTILS_StringToIntArray(filename),
						fileKey,
						fileKey.slice()
						)
						),
						cur: cur,
						total: totalSlice
					},loginObj.serverSk);
					headers.Cookie = cookie;
					headers["X-Upload-Headers"]=uploadHeaders;
					//console.log(headers);
					
					var encrypted = new Buffer(pfcctr.PFCCTR_Encrypt(
					pfcctr.PFCCTR_Encrypt(util.UTILS_ArrayBufferToIntArray(data), fileKey, fileKey.slice()),loginObj.serverSk, loginObj.serverSk.slice()));
					//console.log(encrypted);
					form.append('file',encrypted,'blob');
					//console.log(form);
					
					var options = {
						host: '140.116.247.10',
						port: 80,
						path: "/storage/Server/upload.jsp",
						method: 'POST',
						headers: headers
					};
					var httpreq = http.request(options, function (response) {
						response.setEncoding('utf8');
						response.on('data', function (data) {
							var json = JSON.parse(crypt.HELPER_DecryptString(data.trim(), loginObj.serverSk));
							//console.log(json);
							
							remains--;
							if(remains==0)
							{
								console.log("remain: "+remains);
								_onServerFinish();
							}
						});
					});
					form.pipe(httpreq);
				}	
			});
			
			input.on('end', function() {
				//console.log("read file finish");
			});
			
			function _onServerFinish(){
				var form = new FormData();
				
				var headers = form.getHeaders();
				var uploadHeaders = crypt.HELPER_GenerateEncryptedRequest({
					userID: loginObj.userID,
					timestamp: timestamp,
					parent: '',
					keywords: keywords,
					isDirectory: false,
					fileSize: filesize,
					name: util.UTILS_IntArrayToHexString(
					pfcctr.PFCCTR_Encrypt(
					util.UTILS_StringToIntArray(filename),
					fileKey,
					fileKey.slice()
					)
					),
					cur: totalSlice+1,
					total: totalSlice
				},loginObj.serverSk);
				headers.Cookie = cookie;
				headers["X-Upload-Headers"]=uploadHeaders;
				//console.log(headers);
				
				form.append('file','','blob');
				//console.log(form);
				
				var options = {
					host: '140.116.247.10',
					port: 80,
					path: "/storage/Server/upload.jsp",
					method: 'POST',
					headers: headers
				};
				var httpreq = http.request(options, function (response) {
					response.setEncoding('utf8');
					response.on('data', function (data) {
						var json = JSON.parse(crypt.HELPER_DecryptString(data.trim(), loginObj.serverSk));
						//console.log(json);
						
						_sendFileMeta();
					})
				});
				form.pipe(httpreq);					
			}
				
				function _sendFileMeta(){
					var postParam = querystring.stringify({
						data: crypt.HELPER_GenerateEncryptedRequest({
							parent: '',
							fileKey: util.UTILS_IntArrayToHexString(
							pfcctr.PFCCTR_Encrypt(
							fileKey,
							loginObj.userKey,
							loginObj.userKey.slice()
							)
							),
							name: util.UTILS_IntArrayToHexString(
							pfcctr.PFCCTR_Encrypt(
							util.UTILS_StringToIntArray(filename),
							fileKey,
							fileKey.slice()
							)
							),
							isDirectory: false
						}, loginObj.proxySk)
					});					
					var options = {
						host: '140.116.247.10',
						port: 80,
						path: "/storage/upload.jsp",
						method: 'POST',
						headers: {
							'Content-Type': 'application/x-www-form-urlencoded',
							'Content-Length': Buffer.byteLength(postParam),
							'Cookie': cookie
						}
					};
					var httpreq = http.request(options, function (response) {
						response.setEncoding('utf8');
						response.on('data', function (data) {
							var json = JSON.parse(crypt.HELPER_DecryptString(data.trim(), loginObj.proxySk));
							// console.log(json);
							// console.log(keyword+" finish!");
							// db_datas++;
							// dfd.resolve("SUCCESS5");
						})
					});
					httpreq.write(postParam);
					httpreq.end();
				}
			}
			var input = fs.createReadStream(filePath,{ highWaterMark: 1024*1024 });
			var fileSize=(fs.statSync(filePath))["size"];
			var timestamp=new Date().getTime();
			readLines(input,timestamp,fileSize,filename);	
		}
	};					