var app = require('../app');
var express = require('express');
var router = express.Router();
var geth = require('../models/geth.js');
var db = require('../models/db.js');
var Serverdownload = require('../models/ServerDownload.js');
var uploadDB = require('../models/uploadDB');

/* GET users listing. */
router.get('/', function(req, res, next) {

    if(app.getServerState() != "STABLE") {
		res.sendStatus(404);
	} else {
        res.render('users', { title: 'For Users', Persons: {}});
    }
});

router.post('/receiveAddr', function(req, res, next) {
    let dest = req.body.addr;
    dest = "0xda32f218a5127b5396bd320be641152095f6b47c";       // TODO: ...
    if(dest == undefined)
        res.send("addr does not exist.");

    geth.sendEth(dest)
    .then( tHash => {
        // console.log("tHash in route:  " + tHash);
        res.send({
            tHash: tHash
        });
    })
    .catch( err => {
        console.log(err);
    });
});

router.post('/', function(req,res){
    x = req.body.tag;
    console.log(x);
    
	try{
		db.dbquery(x)
		.then( (resp) => {
            console.log(resp);

		    if(resp.length==0) {
				 res.send("Oops!! There is no result named " + x);
			} else {
			     res.render('users.ejs',{Persons: resp});
            }
		})
		.catch( (err) => {
			console.log(err);
		})
	} catch (e){
		console.log(e);
	}
})

router.get('/download',function(req,res){
	if(app.getServerState() == "STABLE"){
        let keyword=req.query.keyword;
        let slice=req.query.slice;
        let ssn = req.session;
        let loginObj = app.getLoginObject();

        // console.log("in controller: ");
        // console.log(keyword);
        // console.log(slice);
        // console.log(ssn);
        // console.log(loginObj);

        Serverdownload.DownloadFile(loginObj.userID,loginObj.userKey, loginObj.serverSk,loginObj.proxySk,loginObj.keywordKey, keyword,uploadDB.getCookie(),slice,ssn,function(data) {
            res.writeHead(200, {"Content-Type": "text/plain;charset=utf-8"});
            res.end(data);
        });
	}else{
		res.sendStatus(404);
	}
})

router.get('/detail', function(req, res) {
    let x = req.query.tag;
    // console.log("in controller: /user/detail/?keyword=");
    // console.log(x);

    db.dbquery2(x)
    .then( (resp) => {
        // console.log("======");
        // console.log(resp);
        res.render('detail.ejs',{ Persons: resp });
    })
    .catch( (err) => {
        console.log(err);
    })
})

module.exports = router;
