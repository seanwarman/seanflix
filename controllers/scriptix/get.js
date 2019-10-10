const MongoClient = require('mongodb').MongoClient;
const url = require('../../config').url;
const dbName = require('../../config').dbName;
const client = new MongoClient(url, { useNewUrlParser: true });

module.exports = {
  main(req, res) {
   // Use connect method to connect to the Server
    client.connect(function(err) {
      console.log("Connected successfully to server");
      const db = client.db(dbName);

      const findDocuments = function(db, callback) {
        // Get the documents collection
        const collection = db.collection('scriptix');
        // Find some documents
        collection.find({}).toArray(function(err, docs) {
          console.log("Found the following records");
          console.log(docs)
          callback(docs);
        });
      }

      findDocuments(db, function(docs) {
        client.close();
        res.send({ body: docs });
      });
    });

  }
}

