var express = require('express');
var router = express.Router();
var geth = require('../models/geth.js');

/* GET home page. */
router.get('/', function(req, res, next) {
    res.render('index', { title: 'Express' });
});

// get userInfo
router.get('/userInfo', function(req, res, next) {
    let userInfo = geth.getUserInfo();
    res.send(userInfo);
});

// put fileHash onto blockchain
router.post('/fileHash', function(req, res, next) {
    let fileHash = req.body.fileHash;
    // console.log(fileHash);

    geth.uploadFileHash(fileHash)
    .then( tHash => {
        console.log("tHash in route:  " + tHash);
        res.send({
            tHash: tHash
        });
    })
    .catch( err => {
        console.log(err);
    });
})

// get transaction information, such as blocknumber ...
router.post('/tHash', function(req, res, next) {
    let tHash = req.body.tHash;
    // console.log(tHash);

    let resp = geth.checkTHash(tHash);
    res.send(resp);
})

// create a contract. return when compiled, not mined
router.post('/contract', function(req, res, next) {
    let addr1 = req.body.addr1;
    let addr2 = req.body.addr2;
    console.log(addr1, addr2);

    let resp = geth.createContract();
    res.send(resp);
})

// TODO: change to query addr. in database
// get latest contract address.
router.get('/contract', function(req, res, next) {
    let resp = geth.getLatestContract();
    res.send(resp);
})

module.exports = router;
