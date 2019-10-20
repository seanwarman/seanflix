const MongoClient = require('mongodb').MongoClient;
const url = require('../../config').url;
const dbName = require('../../config').dbName;
const client = new MongoClient(url, { useNewUrlParser: true });

module.exports = {
  main(req, res) {

    console.log('Get method un-implemented');

  }
}

