
const isObject      = require('nlab/isObject');

const log           = require('inspc');

const trim          = require('nlab/trim');

const cache = {};

const th = msg => `mrequest-abstract.js: ` + msg;

/**
 * This abstract layer is isolated to separate file in order to provide encryption agnostic library
 * If there is need to specify custom encryption then you have to extend this object
 * like it is done in mrequest.js
 *
 * @param register
 * @returns {Function}
 */
const tool = register => {

    if ( typeof register !== 'string') {

        log.t(th(`register is not string`))

        throw th(`register is not string`)
    }

    register = register.trim();

    if ( ! register ) {

        log.t(th(`register is not defined`))

        throw th(`register is not defined`)
    }

    if ( ! cache[register] ) {

        const msg = `can't find mediator setup base on register '${register}', use first mediator.create(register, domain, port, cluster) or mediator.create(register, {domain, port, cluster})`;

        log.t(th(msg))

        throw th(msg);
    }

    const {
        domain,
        port,
        thisCluster,
        thisNode,
        targetCluster,
        targetNode,
        encoder,
        decoder,
        authenticator,
    } = cache[register];

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

            stringsOrNull.unshift(targetNode);
        }

        if (stringsOrNull.length < 3) {

            stringsOrNull.unshift(targetCluster);
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

            // '/one/:cluster/:node(([^\\/]+)|)/:path(*)?'
            let furl = `${url}/one/${cluster}/${node}${path}`;

            let opt = {
                method: 'post',
                headers: {
                    'Content-type': 'application/json; charset=utf-8',
                },
                body: JSON.stringify({
                    fromCluster : thisCluster,
                    fromNode    : thisNode,
                    payload     : encoder(data)
                })
            };

            [furl, opt] = authenticator(furl, opt);

            let cres;

            const promise = fetch(furl, opt)
                .then(res => {

                    cres = res;

                    return res.json();
                })
                .then(json => {

                    if (cres.status != 200) {

                        return Promise.reject(json);
                    }

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

tool.create = ((register, opt) => {

    if (typeof port === 'undefined') {

        opt.port = null;
    }

    return tool.register(register, opt);
});

tool.register = (register, opt) => {

    let {domain, port, thisCluster, thisNode, targetCluster, targetNode, encoder, decoder, authenticator} = opt;

    if ( typeof domain !== 'string') {

        log.t(th(`register(), domain is not string`))

        throw th(`register(), domain is not string`)
    }

    domain = domain.trim();

    domain = trim(domain, '/', 'r');

    if ( ! domain ) {

        log.t(th(`register(), domain is not defined`))

        throw th(`register(), domain is not defined`)
    }

    if ( /^https:\/\//.test(domain) ) {

        log.t(th(`register(), domain should start from http:// or https://`))

        throw th(`register(), domain should start from http:// or https://`)
    }

    if ( typeof targetCluster !== 'string') {

        log.t(th(`register(), targetCluster is not string`))

        throw th(`register(), targetCluster is not string`)
    }

    targetCluster = targetCluster.trim();

    if ( ! targetCluster ) {

        log.t(th(`register(), targetCluster is not defined`))

        throw th(`register(), targetCluster is not defined`)
    }

    if ( typeof thisCluster !== 'string') {

        log.t(th(`register(), thisCluster is not string`))

        throw th(`register(), thisCluster is not string`)
    }

    thisCluster = thisCluster.trim();

    if ( ! thisCluster ) {

        log.t(th(`register(), thisCluster is not defined`))

        throw th(`register(), thisCluster is not defined`)
    }

    if ( port !== null && typeof port !== 'string' && typeof port !== 'number') {

        log.t(th(`register(), port is not null not a number nor string`))

        throw th(`register(), port is not null not a number nor string`);
    }

    if ( targetNode !== null && typeof targetNode !== 'string') {

        log.t(th(`register(), targetNode is not null nor string`))

        throw th(`register(), targetNode is not null nor string`);
    }

    if ( thisNode !== null && typeof thisNode !== 'string') {

        log.t(th(`register(), thisNode is not null nor string`))

        throw th(`register(), thisNode is not null nor string`);
    }

    if (typeof encoder !== 'function') {

        log.t(th(`register(), encoder is not a function`))

        throw th(`register(), encoder is not a function`);
    }

    if (typeof decoder !== 'function') {

        log.t(th(`register(), decoder is not a function`))

        throw th(`register(), decoder is not a function`);
    }

    if (typeof authenticator !== 'function') {

        log.t(th(`register(), authenticator is not a function`))

        throw th(`register(), authenticator is not a function`);
    }

    cache[register] = {domain, port, thisCluster, thisNode, targetCluster, targetNode, encoder, decoder, authenticator};

    return tool(register);
};

tool.delete = register => {

    delete cache[register];

    return tool;
};

module.exports = tool;