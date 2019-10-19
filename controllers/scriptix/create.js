const MongoClient = require('mongodb').MongoClient;
const url = require('../../config').url;
const dbName = require('../../config').dbName;
const uuid = require('uuid');

module.exports = {
  async main(req, res) {

    let error;
    let client = new MongoClient(url, { useNewUrlParser: true });

    try {
      client = await client.connect();
    } catch (e) {
      console.log('There was an error connecting to the database: ', e);
      error = e;
    }
    
    if(error) {
      res.status(500).send();
    }

    const db = client.db(dbName);
    const collection = db.collection('scriptix');

    let result;
    const data = req.body.data;

    try {
      result = await collection.insertOne(data);
    } catch (e) {
      console.log('There was an error inserting to the database: ', e);
      error = e;
    }
    
    client.close();

    if(error) {
      res.status(500).send();
    }
    
    res.send({body: result});

  }
}
