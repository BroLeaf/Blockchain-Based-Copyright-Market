var express = require('express');
var router = express.Router();
var geth = require('../models/geth.js');

/* GET users listing. */
router.get('/', function(req, res, next) {
    res.render('users', { title: 'For Users' });
});

router.post('/receiveAddr', function(req, res, next) {
    let dest = req.body.addr;
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

module.exports = router;
