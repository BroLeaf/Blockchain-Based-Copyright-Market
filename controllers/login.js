var express = require('express');
var router = express.Router();
var querystring = require('querystring');
var http = require('http');
var session = require('express-session')({
	secret:'XASDASDA', 
	resave: true,
	saveUninitialized: true
});
var util = require('../models//Utility');

/* GET users listing. */
router.get('/', function(req, res, next) {
    res.render('login', { title: 'For Login' });
});

router.post('/maka', function (req, res) {
	console.log("in controller/login.js post maka");
	var data = querystring.stringify(req.body);
	ssn = req.session;
	ssn.idc = req.body.idc;
	var options = {
		host: '127.0.0.1',
		port: 8080,
		path: '/ACS_JSP/maka.jsp',
		method: 'POST',
		headers: {
			'Content-Type': 'application/x-www-form-urlencoded',
			'Content-Length': Buffer.byteLength(data)
		}
	};
	console.log("... 1");
	var httpreq = http.request(options, function (response) {
		response.setEncoding('utf8');
		response.on('data', function (chunk) {
			var obj = JSON.parse(chunk);
			var sk= util.UTILS_HexStringToIntArray(obj.SK);
			ssn.sk=JSON.stringify(Array.apply([], sk));
			res.send(chunk);
		});
	});
	console.log("... 2");
	httpreq.write(data);
	httpreq.end();
});

module.exports = router;