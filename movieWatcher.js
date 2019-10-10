const fs = require('fs');
const exec = require('child_process').exec;
const uuid = require('uuid');
const MongoClient = require('mongodb').MongoClient;
const url = require('./config').url;
const dbName = require('./config').dbName;

module.exports = {
  main() {
    let files = [];
    fs.watch('./drop', 'utf8', (e, filename) => {
      if(files.find(file => file === filename || file === '.gitkeep')) return;
      files.push(filename);

      const id = uuid.v1();
      const title = filename.slice(0, filename.lastIndexOf('.'));
      const ext = filename.slice(filename.lastIndexOf('.') + 1);
      let filenameEscaped = filename.replace(/ /g, '\\ ');
      filenameEscaped = filenameEscaped.replace(/\(/g, '\\(');
      filenameEscaped = filenameEscaped.replace(/\)/g, '\\)');

      const mv = 'mv ./drop/' + filenameEscaped + ' ./client/public/movies/' + id + '.' + ext;

      exec(mv, async err => {
        if(err) {
          console.log('There was an error moving the file: ', err);
          return;
        }

        console.log('The file was moved successfully!');

        let client = new MongoClient(url, { useNewUrlParser: true });

        try {
          client = await client.connect();
        } catch (e) {
          throw e;
        }

        const db = client.db(dbName);
        const collection = db.collection('seanflix');

        let result;

        const data = {
          id: id,
          title: title,
          filename: id + '.' + ext,
          fileType: ext,
          path: '/movies',
          image: null,
          genre: null,
          favourite: false
        }

        try {
          // insertMany expects and array of objects
          result = await collection.insertMany([data]);
        } catch (err) {
          console.log('There was an error saving the filename to the db: ', err);
        }

        client.close();
        files = files.filter( file => file !== filename );
      });
    })
  }
}
