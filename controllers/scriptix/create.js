const MongoClient = require('mongodb').MongoClient;
const url = require('../../config').url;
const dbName = require('../../config').dbName;

module.exports = {
  async main(req, res) {

    let client = new MongoClient(url, { useNewUrlParser: true });

    try {
      client = await client.connect();
    } catch (e) {
      throw e;
    }

    const db = client.db(dbName);
    const collection = db.collection('scriptix');

    let result;

    try {
      // insertMany expects and array of objects
      result = await collection.insertMany(req.body.data);
    } catch (e) {
      throw e;
    }

    client.close();

    res.send({ body: result });

  }
}
