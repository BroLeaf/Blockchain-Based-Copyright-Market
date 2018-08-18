var express = require('express');
var router = express.Router();
var geth = require('../models/geth.js');

/* GET home page. */
router.get('/', function(req, res, next) {
    let userInfo = geth.getUserInfo();
    res.render('demo', {userInfo: userInfo});
});

module.exports = router;
