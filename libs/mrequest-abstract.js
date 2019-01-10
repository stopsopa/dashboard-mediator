
const isObject      = require('nlab/isObject');

const log           = require('inspc');

const cache = {};

const th = msg => `mrequest-abstract.js: ` + msg;

const tool = name => {

    if ( ! cache[name] ) {

        throw th(`can't find mediator setup base on name '${name}', use first mediator.create(name, domain, port, cluster) or mediator.create(name, {domain, port, cluster})`);
    }

    const [
        domain,
        port,
        cluster,
        node,
        encoder,
        decoder,
        authenticator,
    ] = cache[name];

    let url = domain;

    if (port != 80) {

        url += ':' + port;
    }

    return (...args) => {
        // cluster, node, path, json
        // node, path, json
        // path, json

        let stringsOrNull = [];

        let other         = [];

        args.forEach(a => {
            if (typeof a === 'string' || a === null) {
                stringsOrNull.push(a)
            }
            else {
                other.push(a);
            }
        });

        if (stringsOrNull.length < 3) {

            stringsOrNull.unshift(node);
        }

        if (stringsOrNull.length < 3) {

            stringsOrNull.unshift(cluster);
        }

        if (stringsOrNull.length < 3) {

            log.start();

            log.dump(args);

            args = log.get(false);

            log.start();

            log.dump(stringsOrNull);

            stringsOrNull = log.get(false);

            log.start()

            log.dump(other)

            other = log.get(false);

            throw th(`
expect arguments like:

    mediator(path[string], {});
    mediator(node[string|null], path[string], {});
    mediator(cluster[string], node[string|null], path[string], {});
    
    so from 2 up to 4 arguments but received:
args: ${args}
stringsOrNull: ${stringsOrNull}
other: ${other}

`);
        }

        {
            let [
                cluster,
                node,
                path = '',
            ] = stringsOrNull;

            if ( typeof path !== 'string' ) {

                path = '';
            }

            if ( ! node ) {

                node = '';
            }

            let data = other.shift();

            if ( ! isObject(data)) {

                data = {};
            }

            let furl = `${url}/one/${cluster}/${node}${path}`;
            // '/one/:cluster/:node(([^\\/]+)|)/:path(*)?'

            let opt = {
                method: 'post',
                headers: {
                    'Content-type': 'application/json; charset=utf-8',
                },
                body: JSON.stringify({
                    payload: encoder(data)
                })
            };

            [furl, opt] = authenticator(furl, opt);

            // log.dump([furl, opt], 5);

            const promise = fetch(furl, opt)
                .then(res => res.json())
                .then(json => {

                    const decoded = decoder(json);

                    if (decoded.then) {

                        return decoded.then;
                    }

                    return Promise.reject(decoded.catch);
                })
            ;

            promise.catch(e => {
                log.dump(e, 5);
            });

            return promise;
        }
    };
};

tool.create = ((name, domain, port, cluster, node, encoder, decoder, authenticator) => {

    if (isObject(domain)) {

        const {
            domain,
            port = null,
            cluster,
            node,
            encoder,
            decoder,
            authenticator,
        } = domain;
    }

    if ( typeof domain !== 'string') {

        throw th(`create(), domain is not string`)
    }

    domain = domain.trim();

    if ( ! domain ) {

        throw th(`create(), domain is not defined`)
    }

    if ( /^https:\/\//.test(domain) ) {

        throw th(`create(), domain should start from http:// or https://`)
    }

    if ( typeof cluster !== 'string') {

        throw th(`create(), cluster is not string`)
    }

    cluster = cluster.trim();

    if ( ! cluster ) {

        throw th(`create(), cluster is not defined`)
    }

    if ( port !== null) {

        if (typeof port !== 'string' && typeof port !== 'number') {

            throw th(`create(), port is not a number nor string`);
        }
    }

    if ( node !== null) {

        if (typeof node !== 'string') {

            throw th(`create(), node is not a string`);
        }
    }

    if (typeof encoder !== 'function') {

        throw th(`create(), encoder is not a function`);
    }

    if (typeof decoder !== 'function') {

        throw th(`create(), decoder is not a function`);
    }

    if (typeof authenticator !== 'function') {

        throw th(`create(), authenticator is not a function`);
    }

    tool.register(name, [domain, port, cluster, node, encoder, decoder, authenticator]);

    return tool(name);
});

tool.register = (name, config) => cache[name] = config;

tool.delete = name => {

    delete cache[name];

    return tool;
};

module.exports = tool;