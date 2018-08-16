var MongoClient = require('mongodb').MongoClient;
var uploadDB = require('./uploadDB');
var url = "mongodb://127.0.0.1:27017/demo0811";
var dbCollectionName = "works"
var resp;

function _dbquery(key, value) {

    MongoClient.connect(url, function(err, db) {
        if (err) throw err;

        db.collection(dbCollectionName, function(err, collection) {
            let query = {};
            query[key] = new RegExp(value);
            collection.find(query).toArray(function(err, items){
                if(err) throw err;
                resp = items;

                console.log("\n===== db.js query =====");
                console.log(resp);
                console.log("===== db.js query =====\n");
            });
        });

        db.close();
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
        });

      	db.close();
    });
}

module.exports = {
    dbquery: _dbquery,
	dbinsert: _dbinsert,
}