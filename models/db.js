var MongoClient = require('mongodb').MongoClient;
var uploadDB = require('./uploadDB');
var url = "mongodb://127.0.0.1:27017/demo0811";
var dbCollectionName = "works"
var resp;

function _dbquery(key, value) {

    return new Promise(function(resolve, reject){
        MongoClient.connect(url, function(err, db) {
            if (err) throw err;
    
            db.collection(dbCollectionName, function(err, col) {
                let query = {};
                query[key] = new RegExp(value);

                col.find(query).toArray(function(err, items){
                    if(err) reject(err);
                    else resolve(items);
    
                    console.log("\n===== db.js query =====");
                    console.log(items);
                    console.log("===== db.js query =====\n");
                });
            });
    
            db.close();
        });
    });
}

function _dbinsert(obj) {
    MongoClient.connect(url, function(err, db) {	
        if (err) throw err;

        db.collection(dbCollectionName, function(err, collection) {
            collection.insert(obj);
        });
        
      	db.close();
    });
}

module.exports = {
    dbquery: _dbquery,
	dbinsert: _dbinsert,
}