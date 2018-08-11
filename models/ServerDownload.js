let http = require('http');
let crypt = require('./usage');
let util = require('./Utility');
let pfcctr = require('./PFCCTR');
let Downloader = require('./downloader');

module.exports = {
    DownloadFile: function(userID, userkey, serverSk, proxySk, EnkeywordKey, keyword,cookie,slice,ssn,CALLBACK) {
        let DekeywordKey = pfcctr.PFCCTR_Decrypt(
            EnkeywordKey,
            userkey,
            userkey.slice());
		getIndex(userID, userkey, serverSk, proxySk, DekeywordKey, keyword,cookie,slice,ssn,CALLBACK);
    }
}

function getIndex(userID, userkey, serverSk, proxySk, keywordKey, keyword,cookie,slice,ssn,CALLBACK) {
    let data = "data=" + crypt.HELPER_GenerateEncryptedRequest({
        userID: userID,
        keyword: util.UTILS_IntArrayToHexString(pfcctr.PFCCTR_Encrypt(util.UTILS_StringToIntArray(keyword), 
        keywordKey, keywordKey.slice()))
    }, serverSk);
    let dataString = '';
    let options = {
        host: '140.116.247.10',
        port: 80,
        path: '/storage/Server/search.jsp',
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Content-Length': Buffer.byteLength(data),
			'Cookie' : cookie
        }
    };
    let httpreq = http.request(options
    , function (response) {
        response.setEncoding('utf8');
        response.on('data', function (chunk) {
            let json = JSON.parse(crypt.HELPER_DecryptString(chunk.trim(), serverSk));
            let timestamp = new Date().getTime();
			
			if(slice == 0)
				new Downloader(json.list[0].name, userID, userkey, proxySk, serverSk, timestamp,cookie,ssn,CALLBACK).start();
			else
				new Downloader(json.list[0].name, userID, userkey, proxySk, serverSk, timestamp,cookie,ssn,CALLBACK)._getslice(slice);
        });
        
    });
    //console.log(data);
    httpreq.write(data);
    httpreq.end();
}
