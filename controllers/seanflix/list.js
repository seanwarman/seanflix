const MongoClient = require('mongodb').MongoClient;
const url = require('../../config').url;
const dbName = require('../../config').dbName;

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
    
    const collection = db.collection('seanflix');
    let data;

    try {
      data = await collection.find({}).toArray();
    } catch (e) {
      console.log('There was an error finding the seanflix records: ', e);
      error = e;
    }
    
    client.close();
    
    if(error) {
      res.status(500).send();
    }
    
    res.send({body: data});
  }
}
