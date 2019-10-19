const MongoClient = require('mongodb').MongoClient;
const ObjectId = require('mongodb').ObjectId; 
const url = require('../../config').url;
const dbName = require('../../config').dbName;

module.exports = {
  async main(req, res) {

    console.log('params: ', req.params);
    res.send({ body: {message: 'There was an error doing such and such'}})

    // let error;

    // let client = new MongoClient(url, { useNewUrlParser: true });

    // try {
    //   client = await client.connect();
    // } catch (e) {
    //   res.send({ body: e });
    // }

    // const db = client.db(dbName);
    // const collection = db.collection('scriptix');

    // let result;

    // // try {
    // //   result = await collection.deleteOne({ id: })
    // // } catch (e) {
    // //   error = e;
    // // }

    // client.close();

    // if(error) {
    //   res.send({ body: error })
    // }
    // res.send({ body: result });
  }
}