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

module.exports = router;
