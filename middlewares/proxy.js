
const isObject      = require('nlab/isObject');

const aes256        = require('nlab/aes256');

const knex          = require('@stopsopa/knex-abstract');

const log           = require('inspc');

const validator     = require('@stopsopa/validator');

const trim          = require('nlab/trim');

const querystring = require('querystring');

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

    /**
fetch('/register', {
	method: 'post',
	headers: {
		'Content-type': 'application/json; charset=utf-8',
    },
	body: JSON.stringify({
		cluster: 'cluster1',
		node: 'ddd',
		domain: 'dom66',
		port: '90',
		// id: 19
	})
}).then(res => res.json()).then(data => console.log('end', data))
     */
    app.all('/register', async (req, res) => {

        let entity              = req.body;

        let id                  = entity.id;

        const mode              = id ? 'edit' : 'create';

        const man               = knex().model.clusters;

        const validators        = man.getValidators(mode, id, entity);

        if (mode === 'create') {

            entity = {
                ...man.initial(),
                ...entity,
            };
        }

        const entityPrepared    = man.prepareToValidate(entity, mode);

        const errors            = await validator(entityPrepared, validators);

        if ( ! errors.count() ) {

            try {

                if (mode === 'edit') {

                    await man.update(entityPrepared, id);
                }
                else {

                    id = await man.insert(entityPrepared);
                }

                entity = await man.find(id);

                if ( ! entity ) {

                    return res.jsonError("Database state conflict: updated/created entity doesn't exist");
                }
            }
            catch (e) {

                log.dump(e);

                return res.jsonError(`Can't register: ` + JSON.stringify(req.body) + ', reason: ' + e.e);
            }
        }

        return res.jsonNoCache({
            entity: entity,
            errors: errors.getTree(),
        });

    });

    let i = 0;

    const send = ({
        domain,
        port,
    }, path, data) => {

        let url = domain;

        if (port != 80) {

            url += ':' + port;
        }

        url += path;

        let tmp;

        return fetch(url, {
            method: 'post',
            headers: {
                'Content-type': 'application/json; charset=utf-8',
            },
            body: JSON.stringify(data)
        }).then(res => {
            tmp = res;
            return res.json();
        }).then(
            d => ({then: d}),
            e => {

                const resp = {catch: e};

                tmp && (resp.res = {
                    status: tmp.status,
                    url: tmp.url,
                    statusText: tmp.statusText,
                    headers: (function (){
                        try {
                            return tmp.headers._headers;
                        }
                        catch (e) {

                            return `can't extract`;
                        }
                    }()),
                });

                return resp;
            }
        );
    }
    /**
fetch('/many/root/test', {
    method: 'post',
    headers: {
        'Content-type': 'application/json; charset=utf-8',
    },
    body: JSON.stringify({data:'value'})
}).then(res => res.json()).then(data => console.log('end', data))
     */
    app.all('/many/:cluster/:path(*)', async (req, res) => {

        try {

            let {
                cluster,
                path,
            } = req.params;

            path = trim(path, '/');

            path = '/' + path;

            let query = querystring.stringify(req.query);

            if (query) {

                path += '?' + query;
            }

            const found = await knex().model.clusters.findClusters({
                cluster,
            });

            if ( ! found.length ) {

                return res.jsonError(`cluster not found`);
            }

            try {

                const data = await Promise.all(found.map(d => send(d, path, req.body)))

                return res.jsonNoCache(data);
            }
            catch (e) {

                return res.jsonError(e + '');
            }
        }
        catch (e) {

            log.dump(e);

            return res.jsonError(`Can't many proxy`);
        }
    });
    /**
fetch('/one/root/dd/test', {
	method: 'post',
	headers: {
		'Content-type': 'application/json; charset=utf-8',
    },
	body: JSON.stringify({data:'value'})
}).then(res => res.json()).then(data => console.log('end', data))
     */
    app.all('/one/:cluster/:node(([^\\/]+)|)/:path(*)?', async (req, res) => {

        try {

            let {
                cluster,
                node,
                path,
            } = req.params;

            path = trim(path || '', '/');

            path = '/' + path;

            let query = querystring.stringify(req.query);

            if (query) {

                path += '?' + query;
            }

            if (typeof node === 'undefined') {

                node = null;
            }

            const found = await knex().model.clusters.findClusters({
                cluster,
                node,
            });

            // log.dump({
            //     route: 'one',
            //     found,
            //     cluster,
            //     node,
            //     path,
            //     body: req.body,
            // }, 3);

            if ( ! found.length ) {

                return res.jsonError(`clusters not found`);
            }

            try {

                const data = await send(found.shift(), path, req.body);

                return res.jsonNoCache(data);
            }
            catch (e) {

                return res.jsonError(e + '');
            }
        }
        catch (e) {

            log.dump(e);

            return res.jsonError(`Can't one proxy`);
        }
    });
}