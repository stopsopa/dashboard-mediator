
const knex              = require('@stopsopa/knex-abstract');


const log               = require('@stopsopa/knex-abstract/log/logn');

module.exports = async (req, res) => {

    try {

        const data = await knex().model.common.query(`show tables`);

        return res.json({
            body: req.body,
            query: req.query,
            node: process.version,
            data,
        })
    }
    catch (e) {

        log.dump(e);

        return res.json({
            error: 'sql error',
        })
    }
}