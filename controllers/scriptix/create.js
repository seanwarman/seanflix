const MongoClient = require('mongodb').MongoClient;
const url = require('../../config').url;
const dbName = require('../../config').dbName;
const uuid = require('uuid');

module.exports = {
  async main(req, res) {

    let client = new MongoClient(url, { useNewUrlParser: true });

    let error;

    try {
      client = await client.connect();
    } catch (e) {
      error = e;
      error.message = 'There was an error connecting to the database.';
    }

    if(error) {
      res.send({ body: error });
    }

    const db = client.db(dbName);
    const collection = db.collection('scriptix');

    let result;

    try {
      // insertMany expects and array of objects
      result = await collection.insertMany(req.body.data);
    } catch (e) {
      error = e
      error.message = 'There was an error inserting to scriptix.';
    }
    
    client.close();

    if(error) {
      res.send({ body: error });
    }
    
    res.send({ body: result });

  }
}
