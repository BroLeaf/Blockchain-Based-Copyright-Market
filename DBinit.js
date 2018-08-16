var MongoClient = require('mongodb').MongoClient;
var url = "mongodb://127.0.0.1:27017/demo0811";

MongoClient.connect(url, function(err, db) {
    console.log("Error: " + err);
    if (err) throw err;
    
    // 'db.works.find()'
    db.collection('works', function(err, col) {

        // Delete all
        col.remove();
        console.log("Collection Deleted\n");

        // Insert
        let obj = [
            { type:'game', auth:'Alice', year:'1997', keyword: 'a1'},
            { type:'music', auth:'Bob', year:'1997', keyword: 'a2'},
            { type:'food', auth:'Carol', year:'2018', keyword: 'a3'},
        ]
        col.insert(obj);
    
        // Count
        col.count(function(err, count) {
            console.log('Total Rows: ' + count);
        });

        // Find with regex
        col.find({ type: new RegExp('mu') }).toArray(function(err, result) {
            console.log("Found Results: " + result.length);
        });

        // Update
        let myQuery = { type: "music"};
        let newValue = { $set: {year: "0"}};
        col.update(myQuery, newValue, function(err, res) {
            console.log('Updated Results: ' + res.result.nModified);
        });
    });

    db.close();
});
