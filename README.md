# SEANFLIX
A Project to serve my movie and music collection so I can get them from anywhere.

## Start up
To run this app run
> node server.js
You should see a prompt saying `'listening on port 5000`
Then cd into `client/` and run
> npm start

## Authentication
There's a password to get into Seanflix but instead you can just put '1234' onto
your browser's `window.localStorage.seanflixAuth`.
 
## DB
I've installed Mongodb for this project.

I think you'll have to create a db in mongo called 'ix'.

The database is set up to configured from a file called `config.js` in the root of this
project.

It should look like this:

```js
module.exports = {
  passwordHash: 'hashString',
  url: 'mongodb url',
  dbName: 'mongodb database name'
}
```

The password bit isn't directly related to the db but I thought this was as good a place
as any to put it.

### Processing mp4 Pattern

There's `drop` a folder for processing, which will act as a dropbox for any new
video files. This folder is watched by fs.watch. If a file enters the
folder it is immediately processed.

#### New mp4 Process

The mp4 filename is taken and saved under 'title' in the db record. A new id
(probably uuid) is created and saved along with the record. At the same
time the file is renamed to the uuid and moved into the movies folder.

The video should then render in the frontend under the 'title', which the
user can change to whatever they want.

### Other Database Record Fields

```js
seanflix.movies = {
  id: '34543-4353466-k3j4h545-34j346',
  title: 'The Matrix',
  path: '/public/movies',
  image: '/pubic/images',
  genre: 'sci-fi',
  favourite: true,
  fileType: 'mp4'
}

seanflix.series = {
  id: '34hwd-3434t-2343wf-32434-23423',
  title: 'True Detective',
  series: 1,
  path: '/public/series',
  genre: 'crime',
  image: '/public/images',
  favourite: true,
    episodes: [
    { episode: 1, id: 's3423t-2343...', fileType: 'mp4' },
    { episode: 2, id: 's3423t-2343...', fileType: 'mp4' },
    { episode: 3, id: 's3423t-2343...', fileType: 'mp4' }
  ]
}
```

### File Structure

```
seanflix
 |_drop
 \_client
     \_public
         |_movies
         |   34543-4353466-k3j4h545-34j346.mp4
         |_series
         |   \_34hwd-3434t-2343wf-32434-23423
         |       s3423t-2343....mp4
         |       s3423t-2343....mp4
         |       s3423t-2343....mp4
         \_images
             34hwd-3434t-2343wf-32434-23423.png
             34543-4353466-k3j4h545-34j346.png
```
