const MongoClient = require('mongodb').MongoClient;
const url = require('../../config').url;
const dbName = require('../../config').dbName;
const uuid = require('uuid');

module.exports = {
  async main(req, res) {

    // check here if the data is our jsonForm, which is the only one
    // we should accept.
    const data = req.body.data;

    // This is a temporary fix...
    if(typeof data.jsonForm !== 'object') {
      console.log('All scriptix records must be in jsonForm format, this is what was sent: ', data);
      return res.status(403).send();
    }
    
    let error;
    let result;
    let client = new MongoClient(url, { useNewUrlParser: true });

    try {
      client = await client.connect();
    } catch (e) {
      console.log('There was an error connecting to the database: ', e);
      error = e;
    }
    
    if(error) {
      return res.status(500).send();
    }

    const db = client.db(dbName);
    const collection = db.collection('scriptix');

    data.id = uuid.v1();

    try {
      result = await collection.insertOne(data);
    } catch (e) {
      console.log('There was an error inserting to the database: ', e);
      error = e;
    }
    
    client.close();

    if(error) {
      return res.status(500).send();
    }
    
    return res.send({body: result});

  }
}
