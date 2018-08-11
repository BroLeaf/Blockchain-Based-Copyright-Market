var MongoClient = require('mongodb').MongoClient;
var url = "mongodb://127.0.0.1:27017/demo0811";
var dbCollectionName = "works"
var resp;

function _dbquery(opp) {

    // console.log(opp);

    MongoClient.connect(url, function(err, db) {
        if (err) throw err;

        db.collection(dbCollectionName, function(err, collection) {
            collection.find({type: opp}).toArray(function(err, items){
                if(err) throw err;
                // console.log(items);
                console.log("We found " + items.length + " results!");
                resp = items;
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

function _dbinsert(type, auth, year) {
    MongoClient.connect(url, function(err, db) {	
        if (err) throw err;

        db.collection(dbCollectionName, function(err, collection) {
            collection.insert({
                type: type,
                auth: auth,
                year: year
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
	dbinsert: _dbinsert,
}