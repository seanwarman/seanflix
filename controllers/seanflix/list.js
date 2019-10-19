const MongoClient = require('mongodb').MongoClient;
const url = require('../../config').url;
const dbName = require('../../config').dbName;

module.exports = {
  async main(req, res) {

    console.log('Calling seanflix list');
    
    let error;
    let client = new MongoClient(url, { useNewUrlParser: true });

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
    
    const collection = db.collection('seanflix');
    let data;

    try {
      data = await collection.find({}).toArray();
    } catch (e) {
      error = e;
      error.message = 'There was an error finding the seanflix records.';
    }
    
    client.close();

    if(error) {
      res.send({body: error});
    }
    
    res.send({body: data});
  }
}
