const crypto = require('crypto');
const config = require('../../config');
const key = '1234';
module.exports = {
    main(req, res) {
        console.log('Calling check');
        console.log(req.body);
        const localStore = req.body.data;
        if(localStore === key) {
          //TODO create a new key store it somewhere and
          //trade it for the old one in the front end.
            res.send({ body: { key: key } });
        } else {
            res.send({ body: { key: null } });
        }
    }
}

