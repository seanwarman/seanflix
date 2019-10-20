const MongoClient = require('mongodb').MongoClient;
const ObjectId = require('mongodb').ObjectId;
const url = require('../../config').url;
const dbName = require('../../config').dbName;

module.exports = {
  async main(req, res) {

    if(!req.params.id) {
      console.log('No id found in the url to delete by.');
      return res.status(403).send();
    }

    let error;
    const data = {
      _id: ObjectId(req.params.id)
    }

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

    try {
      result = await db.collection('scriptix').deleteOne(data);
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