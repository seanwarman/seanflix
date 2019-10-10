const express = require('express'); 
const bodyParser = require('body-parser');
const app = express(); 
const port = process.env.PORT || 5000;
app.use(bodyParser.json()); 
app.use(bodyParser.urlencoded({ extended: true })); 


// ░▀░ █▀▄▀█ █▀▀█ █▀▀█ █▀▀█ ▀▀█▀▀ █▀▀                                █▀▀ █▀▀█ █▀▀▄ ▀▀█▀▀ █▀▀█ █▀▀█ █░░ █░░ █▀▀ █▀▀█ █▀▀
// ▀█▀ █░▀░█ █░░█ █░░█ █▄▄▀ ░░█░░ ▀▀█                                █░░ █░░█ █░░█ ░░█░░ █▄▄▀ █░░█ █░░ █░░ █▀▀ █▄▄▀ ▀▀█
// ▀▀▀ ▀░░░▀ █▀▀▀ ▀▀▀▀ ▀░▀▀ ░░▀░░ ▀▀▀                                ▀▀▀ ▀▀▀▀ ▀░░▀ ░░▀░░ ▀░▀▀ ▀▀▀▀ ▀▀▀ ▀▀▀ ▀▀▀ ▀░▀▀ ▀▀▀

const auth = require('./controllers/auth/auth').main;                app.post('/seanflix/auth', auth);
const check = require('./controllers/auth/check').main;              app.post('/seanflix/auth/check', check);
const wikiInfo = require('./controllers/wikiInfo').main;             app.post('/seanflix/wiki/info', wikiInfo);
const wikiImages = require('./controllers/wikiImages').main;         app.post('/seanflix/wiki/images', wikiImages);

const scriptixCreate = require('./controllers/scriptix/create').main;        app.post('/scriptix/create', scriptixCreate);
const scriptixList = require('./controllers/scriptix/list').main;            app.get('/scriptix/list', scriptixList);

const seanflixCreate = require('./controllers/seanflix/create').main;        app.post('/seanflix/create', seanflixCreate);
const seanflixList = require('./controllers/seanflix/list').main;            app.get('/seanflix/list', seanflixList);
const seanflixUpdate = require('./controllers/seanflix/update').main;        app.put('/seanflix/update', seanflixUpdate);


// █▀▀ ░▀░ █░░ █▀▀   █▀▀ ▀█░█▀ █▀▀ █▀▀▄ ▀▀█▀▀ █▀▀
// █▀▀ ▀█▀ █░░ █▀▀   █▀▀ ░█▄█░ █▀▀ █░░█ ░░█░░ ▀▀█
// ▀░░ ▀▀▀ ▀▀▀ ▀▀▀   ▀▀▀ ░░▀░░ ▀▀▀ ▀░░▀ ░░▀░░ ▀▀▀

const movieWatcher = require('./movieWatcher.js');
movieWatcher.main();
// we'll want another function here that calls every now and then that
// checks for orphaned db records. It should look up every db record id
// and match that to every filename in client/public/movies. Any that
// aren't found should be removed.


app.listen(port, () => console.log(`Listening on port ${port}`));
