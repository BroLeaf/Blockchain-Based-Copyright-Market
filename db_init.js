var MongoClient = require('mongodb').MongoClient;
var url = "mongodb://127.0.0.1:27017/demo0716";

MongoClient.connect(url, function(err, db) {
    if (err) throw err;
    console.log("Database is running");
    
    db.collection('works', function(err, collection) {

        collection.insert({
            keyword:'music', author:'Alice', year:'1997'
        });
    
        collection.count(function(err,count){
            if(err) throw err;
            console.log('Total Rows:' + count);
        });
    });
    db.close();
});
