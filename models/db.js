var MongoClient = require('mongodb').MongoClient;
var uploadDB = require('./uploadDB');
var url = "mongodb://127.0.0.1:27017/demo0811";
var dbCollectionName = "works"
var resp;

function _dbquery(x) {

    MongoClient.connect(url, function(err, db) {
        if (err) throw err;

        db.collection(dbCollectionName, function(err, collection) {
            collection.find({type: new RegExp(x)}).toArray(function(err, items){
                if(err) throw err;
                resp = items;
                // console.log(resp);
            });
        });

        db.close(); //關閉連線
    });

    return new Promise(function(resolve, reject) {
        setTimeout(function(){
            resolve(resp);
        }, 1000);
    });
}

function _dbquery2(x) {

    MongoClient.connect(url, function(err, db) {
        if (err) throw err;

        db.collection(dbCollectionName, function(err, collection) {
            collection.find({keyword: new RegExp(x)}).toArray(function(err, items){
                if(err) throw err;
                resp = items;
                // console.log(resp);
            });
        });

        db.close(); //關閉連線
    });

    return new Promise(function(resolve, reject) {
        setTimeout(function(){
            resolve(resp);
        }, 1000);
    });
}

function _dbinsert(type, auth, year, keyword) {
    MongoClient.connect(url, function(err, db) {	
        if (err) throw err;

        db.collection(dbCollectionName, function(err, collection) {
            collection.insert({
                type: type,
                auth: auth,
                year: year,
                keyword: keyword,
            });
            
            collection.count(function(err,count){
                if(err) throw err;
                console.log('Total Rows:'+count);
            });
        });

      	db.close();
    });
}

module.exports = {
    dbquery: _dbquery,
    dbquery2: _dbquery2,
	dbinsert: _dbinsert,
}