var express = require('express');
var router = express.Router();
var geth = require('../models/geth.js');
var db = require('../models/db.js');

/* GET users listing. */
router.get('/', function(req, res, next) {
    res.render('users', { title: 'For Users', Persons: {}});
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
	opp=req.body.musicname;
	try{
		db.dbquery(opp)
		.then( (resp) => {
            console.log(resp);

		    if(resp.length==0){
				 res.send("Oops!! There is no result named "+opp);
			} else{
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

module.exports = router;
