
const isObject = require('nlab/isObject');

const aes256   = require('nlab/aes256');

const knex     = require('@stopsopa/knex-abstract');

const log      = require('inspc');

module.exports = opt => {

    if ( ! isObject(opt) ) {

        throw `proxy.js: opt is not an object`;
    }

    let {
        password,
        app,
    } = opt;

    if ( typeof password !== 'string' ) {

        throw `opt.password is not string`
    }

    password = password.trim();

    if ( typeof password !== 'string' ) {

        throw `opt.password is string but it's empty`
    }

    const enc = aes256(password);

    app.all('/register', async (req, res) => {

        if ( ! isObject(req.body) ) {

            return res.jsonError(`req.body is not an object`);
        }

        const {
            cluster,
            node,
            domain,
            port = 80,
        } = req.body;

        let {
            id,
        } = req.body;

        try {

            if ( typeof cluster !== 'string' ) {

                return res.jsonError(`cluster is not a string`);
            }

            if ( typeof node !== 'string' ) {

                return res.jsonError(`node is not a string`);
            }

            if ( typeof domain !== 'string' ) {

                return res.jsonError(`domain is not a string`);
            }

            if ( ! port ) {

                return res.jsonError(`port is not defined`);
            }

            const man = knex().model.clusters;


            let entity

            if (id) {

                entity = await man.find(id);
            }
            else {

                entity = await man.queryOne(`select id from :table: where cluster = :cluster and node = :node`, {
                    cluster,
                    node,
                });
            }

            let found = true;

            if ( ! entity ) {

                found = false;

                entity = await man.initial();
            }

            cluster && (entity.cluster = cluster);
            node    && (entity.node = node);
            domain  && (entity.domain = domain);
            port    && (entity.port = port);

            let affected;

            if (found) {

                id = entity.id;

                affected = await man.update(entity, id);
            }
            else {

                id = await man.insert(entity);
            }

            return res.json({
                mode: (found ? 'update' : 'insert'),
                affected,
                id,
            });
        }
        catch (e) {

            log.dump(e)

            return res.jsonError(`Can't register: ` + JSON.stringify(req.body));
        }

    });

    app.all('/proxy', (req, res) => {

        res.json({
            pass: opt,
        })
    });
}