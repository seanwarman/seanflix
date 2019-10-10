const crypto = require('crypto');
const config = require('../../config');
const key = '1234';
module.exports = {
    main(req, res) {
        const password = req.body.data;
        let hash = crypto.createHash('sha256')
        hash = hash.update(password);
        hash = hash.digest('hex');
        if(hash === config.passwordHash) {
            res.send({ body: { key: key } });
        } else {
            res.send({ body: { key: null } });
        }
    }
}
