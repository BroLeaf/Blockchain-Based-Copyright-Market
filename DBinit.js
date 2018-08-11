var MongoClient = require('mongodb').MongoClient;
var url = "mongodb://127.0.0.1:27017/demo0811";

MongoClient.connect(url, function(err, db) {
    console.log("Error: " + err);
    if (err) throw err;
    
    // delete all
    db.collection('works', function(err, col) {
        if(err) throw err;
        col.remove();
        console.log("Collection Deleted");
    });

    // insert one
    db.collection('works', function(err, col) {

        col.insert({
            type:'music', auth:'Alice', year:'1997'
        });
    
        col.count(function(err,count){
            if(err) throw err;
            console.log('Total Rows:' + count);
        });
    });

    db.close();
});
