var express = require('express');
var router = express.Router();
var geth = require('../models/geth.js');

/* GET home page. */
router.get('/', function(req, res, next) {
    res.render('index', { title: 'Express' });
});

router.get('/userInfo', function(req, res, next) {
    let userInfo = geth.getUserInfo();
    res.send(userInfo);
});

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

router.post('/tHash', function(req, res, next) {
    let tHash = req.body.tHash;
    // console.log(tHash);

    let resp = geth.checkTHash(tHash);
    res.send(resp);
})

module.exports = router;
