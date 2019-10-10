const MongoClient = require('mongodb').MongoClient;
const url = require('../../config').url;
const dbName = require('../../config').dbName;

module.exports = {
  async main(req, res) {

    // Create a new MongoClient
    let client = new MongoClient(url, { useNewUrlParser: true });

    try {
      client = await client.connect();
    } catch (e) {
      throw e;
    }

    const db = client.db(dbName);
    
    const collection = db.collection('scriptix');
    let docs;

    try {
      docs = await collection.find({}).toArray();
    } catch (e) {
      throw e;
    }

    client.close();

    res.send({ body: docs });
  }
}

