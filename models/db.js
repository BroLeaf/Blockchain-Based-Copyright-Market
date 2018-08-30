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
				if(key==""){
					//console.log("empty");
					query["$or"] = [
						{"type":new RegExp(value)},
						{"auth":new RegExp(value)},
                        {"year":new RegExp(value)},
                        {"filename":new RegExp(value)},
					];
				}else{
					query[key] = new RegExp(value);
				}				
			
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

function _dbupdate(keyword, addr) {
    MongoClient.connect(url, function(err, db) {	
        if (err) throw err;

        db.collection(dbCollectionName, function(err, col) {
            let myQuery = { "keyword": keyword };
            let newValue = { $set: { "addr": addr } };
            col.update(myQuery, newValue, function(err, res) {
                console.log('Updated Results: ' + res.result.nModified);
            });
        });
        
      	db.close();
    });
}

module.exports = {
    dbquery: _dbquery,
    dbinsert: _dbinsert,
    dbupdate: _dbupdate,
}