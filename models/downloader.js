let http = require('http');
let crypt = require('./usage');
let util = require('./utility');
let pfcctr = require('./pfcctr');
//let decryptor = require('./worker/decryptor_server')
let toArrayBuffer = require('to-array-buffer');
let fs = require('fs');

Downloader.BYTES_PER_CHUNK = 1048576 + 32;
Downloader.SERVER_INFO_URL = "/storage/Server/query.jsp";
Downloader.SERVER_DATA_URL = "/storage/Server/download.jsp";
Downloader.PROXY_URL = "/storage/download.jsp";

function Downloader (id, userID, userKey, proxySk, serverSk, timestamp, cookie,ssn,finishCallback) {
    this.id = id;
    this.userKey = userKey;
    this.proxySk = proxySk;
    this.serverSk = serverSk;
    this.userID = userID;
	
    this.filename = null;
	this.fileKey = null;
    if(ssn.fileKey!=null)
		this.fileKey = new Uint8Array(JSON.parse(ssn.fileKey));
    this.origFileSize = null;
    this.savedFileSize = null;
	
    this.decryptedChunkCount = 0;
    this.downloadedChunkCount = 0;
	
    this.totalSlice = 0;
    this.totalReceived = 0;
	
    this.timestamp = timestamp;
	this.cookie=cookie;
	this.SKc=new Uint8Array(JSON.parse(ssn.sk));
	this.ssn=ssn;
    this.finishCallback = finishCallback;
}
Downloader.prototype = {
	getCookie: function(){
		return this.cookie;
	},
    getId: function() {
        return this.id;
	},
	
    getFilename: function() {
        return this.filename;
	},
	
    setFilename: function(filename) {
        this.filename = filename;
	},
	
    getFileKey: function() {
        return this.fileKey;
	},
	
    setFileKey: function(fileKey) {
        this.fileKey = fileKey;
	},
	
    getOrigFileSize: function() {
        return this.origFileSize;
	},
	
    setOrigFileSize: function(origFileSize) {
        this.origFileSize = origFileSize;
	},
	
    getSavedFileSize: function() {
        return this.savedFileSize;
	},
	
    setSavedFileSize: function(savedFileSize) {
        this.savedFileSize = savedFileSize;
	},
	
    getTransferFileSize: function() {
        return this.savedFileSize + 32;
	},
	
    getTimestamp: function() {
        return this.timestamp;
	},
	
    getUserID: function() {
        return this.userID;
	},
	
    getUserKey: function() {
        return this.userKey;
	},
	
    getProxySk: function() {
        return this.proxySk;
	},
	
    getServerSk: function() {
        return this.serverSk;
	},
	
    getPlainFilename: function() {
        var decryptedFilename = this.getFilename();
        var result = "";
		
        for (var i = 0; decryptedFilename[i] != 0 && i < decryptedFilename.length; i++) {
            result += "%" + ("0" + decryptedFilename[i].toString(16)).slice(-2);
		}
        result = decodeURIComponent(result);
		
        return result;
	},
	
    start: function() {
        let Postdata = "data=" + crypt.HELPER_GenerateEncryptedRequest({
			id: this.getId()
		}, this.getProxySk());
        let options = {
            host: '140.116.247.10',
            port: 80,
            path: Downloader.PROXY_URL,
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Content-Length': Buffer.byteLength(Postdata),
				'Cookie' : this.getCookie()
			},
            downloader: this
		};
        let Download = this;
        let httpreq = http.request(options
		, function(response) {
			response.setEncoding('utf8')
			response.on('data', function (chunk) {
				Download._onProxyFinish(chunk, Download);
			})
			
		});
        httpreq.write(Postdata);
        httpreq.end();
	},
	
    _onProxyFinish: function(data, Download) {
        let resString = '';
        resString += data;
        let json = JSON.parse(crypt.HELPER_DecryptString(resString.trim(), Download.getProxySk()));
        Download.setFileKey(crypt.HELPER_GetRealFileKey(Download.getUserKey(), json.fileKey));
        Download.setFilename(pfcctr.PFCCTR_Decrypt(util.UTILS_HexStringToIntArray(json.name), Download.getFileKey(), Download.getFileKey().slice()));
		Download.ssn.fileKey=JSON.stringify(Array.apply([], Download.getFileKey()));
		
        let Postdata = "data=" + crypt.HELPER_GenerateEncryptedRequest({
            userID: Download.getUserID(),
            id: Download.getId()
		}, Download.getServerSk());
		
        let options = {
            host: '140.116.247.10',
            port: 80,
            path: Downloader.SERVER_INFO_URL,
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Content-Length': Buffer.byteLength(Postdata),
				'Cookie' : this.getCookie()
			},
            downloader: this
		};
        let httpreq = http.request(options
		, function(response) {
			response.setEncoding('utf8')
			response.on('data', function (chunk) {
				Download._onServerInfoFinish(chunk, Download);
			})
			
		});
        httpreq.write(Postdata);
        httpreq.end();
	},
	
    _onServerInfoFinish: function(data, Download) {
        let resString = '';
        resString += data;
        let json = JSON.parse(crypt.HELPER_DecryptString(resString.trim(), Download.getServerSk()));

        Download.setOrigFileSize(json.origSize);
        Download.setSavedFileSize(json.savedSize);
        let current = 1;
        Download.totalSlice = Math.ceil(parseInt(json.savedSize) / Downloader.BYTES_PER_CHUNK);
		
		let resFile = {
            name: Download.getPlainFilename(),
            slice: Download.totalSlice,
            size: Download.getOrigFileSize()
		};
        Download.finishCallback(JSON.stringify(resFile));		
	},
	
	_getslice: function (slice) {
        let Download = this;
        Download._pushAjaxRequest(parseInt(slice, 10), Download);
	},
	_pushAjaxRequest: function(cur, Download) {
		let Postdata = "data=" + crypt.HELPER_GenerateEncryptedRequest({
			userID: Download.getUserID(),
			id: Download.getId(),
			cur: cur
		}, Download.getServerSk());
		let options = {
			host: '140.116.247.10',
			port: 80,
			path: Downloader.SERVER_DATA_URL,
			method: 'POST',
			headers: {
				'Content-Type': 'application/x-www-form-urlencoded',
				'Content-Length': Buffer.byteLength(Postdata),
				'Cookie' : this.getCookie()
			},
			downloader: this,
			chunkReceived: 0,
			chunkId: cur
		};
		
		let bufStr = '';
		let httpreq = http.request(options
		, function(response) {
			response.on('data', function (chunk) {
				bufStr += chunk.toString('binary');
			});
			response.on('end', function() {
				var buf = toArrayBuffer(bufStr);
				Download._onServerDataFinish(buf, Download);
			});
		});
		httpreq.write(Postdata);
		httpreq.end();
	},	
	_onServerDataFinish: function(data, Download) {
		let fileKey=Download.getFileKey();
		let sessionKey=Download.getServerSk();
		let file=pfcctr.PFCCTR_Decrypt(pfcctr.PFCCTR_Decrypt(util.UTILS_ArrayBufferToIntArray(data), 
		sessionKey,sessionKey.slice()),fileKey,fileKey.slice());
		let encfile=pfcctr.PFCCTR_Encrypt(file,Download.SKc,Download.SKc.slice());
		let resFile = {
			filebuf: new Buffer(encfile)
		}
		Download.finishCallback(JSON.stringify(resFile));	
	}
	
}
module.exports = Downloader;