var app = require('../app')
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

	// console.log(app);
	if(app.getServerState() == "STABLE") {
		res.render('login');
	} else {
		res.sendStatus(404);
	}
});

router.post('/maka', function (req, res) {
	if(app.getServerState() != "STABLE") {
		res.sendStatus(404);
	} else {
		let data = querystring.stringify(req.body);
		var ssn = req.session;
        ssn.idc=req.body.idc;
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
		var httpreq = http.request(options, function (response) {
			response.setEncoding('utf8');
			response.on('data', function (chunk) {

				try {
					var obj = JSON.parse(chunk);
					var resend=JSON.stringify({
						result:obj.result,
						IDs:obj.IDs,
						Nx:obj.Nx,
						V4:obj.V4,
						TS:obj.TS
					});
					if(obj.result==true){
						var sk= new Uint8Array(new Buffer(obj.SK,"hex"));
						ssn.sk=JSON.stringify(Array.apply([], sk));
					}
					res.send(resend);
				} catch(e) {
					console.log(e);
					res.sendStatus(500);
				}
			});
		});
		httpreq.write(data);
        httpreq.end();
	}
});

module.exports = router;