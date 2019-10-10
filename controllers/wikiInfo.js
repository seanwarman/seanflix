const wiki = require('wikijs').default;

module.exports = {
    async main(req, res) {

        let data;
        let response;

        try {
            response = await wiki().page(req.body.data);
            data = await response.info();
        } catch (error) {
            res.send({ error });
        }

        res.send({ body: data });
    }
}
