var app = require('../app')
var express = require('express');
var router = express.Router();
var geth = require('../models/geth.js');
var db = require("../models/db.js");

/* GET home page. */
router.get('/', function(req, res, next) {
    if(app.getServerState() != "STABLE") {
        res.sendStatus(404);
    } else if (!req.session.sk){
		console.log("creators not login");
		res.redirect('../login');
    } else {
        res.render('creators', { title: '創作者上傳' });
    }
});

// get userInfo
router.get('/userInfo', function(req, res, next) {
    let userInfo = geth.getUserInfo();
    res.send(userInfo);
});

// put fileHash onto blockchain
router.post('/fileHash', function(req, res, next) {
    let fileHash = req.body.fileHash;
    req.session.fileHash = fileHash;
	console.log(fileHash);

    geth.uploadFileHash(fileHash)
    .then( tHash => {
        res.send({ tHash: tHash });
    })
    .catch( err => {
        console.log(err);
    });
})

// get transaction information, such as blocknumber ...
router.post('/tHash', function(req, res, next) {
    let tHash = req.body.tHash;

    let resp = geth.checkTHash(tHash);
    res.send(resp);
})

// create a contract. return when compiled, not mined
router.post('/contract', function(req, res, next) {
    let addr1 = req.body.addr1;
    let addr2 = req.body.addr2;
    console.log(addr1, addr2);

    let resp = geth.createContract(addr1, addr2, req.session.keyword);
    res.send(resp);
})

// TODO: change to query addr. in database
// get latest contract address.
router.get('/contract', function(req, res, next) {
    let resp = geth.getLatestContract();
    res.send(resp);
})

router.post('/fileInfo', function(req, res, next) {
	if(!req.session.sk) {
        res.send("Login error.");
    }

    let obj = {
        type: req.body.type,
        auth: req.body.auth,
        year: req.body.year,
        keyword: req.session.keyword,
        filename: req.session.filename,
        fileHash: req.session.fileHash,
    }

    db.dbinsert(obj);
    res.send("Insert success.");
})

module.exports = router;
