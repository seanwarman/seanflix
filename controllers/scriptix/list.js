const MongoClient = require('mongodb').MongoClient;
const url = require('../../config').url;
const dbName = require('../../config').dbName;

module.exports = {
  async main(req, res) {
    
    let error;
    let result;
    let client = new MongoClient(url, {useNewUrlParser: true});

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
      result = await db.collection('scriptix').find({}).toArray();
    } catch (e) {
      console.log('There was an error finding the scriptix collection: ', e);
      error = e;
    }

    client.close();
    
    if(error) {
      console.log('There was an error finding the scriptix records.');
      return res.status(500).send();
    }
    
    return res.send({body: result});
  }
}

