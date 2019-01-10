
const isObject      = require('nlab/isObject');

const aes256        = require('nlab/aes256');

const log           = require('inspc');

const jwt           = require('jsonwebtoken');

const th            = msg => `mrequest.js: ` + msg;

const arequest      = require('./mrequest-abstract');

const tool          = name => arequest(name);

/**
 *
 * Extension of mrequest-abstract.js that provide specific encryption method
 * in this case aes256 encryption and jwt authentication
 */
tool.create = (register, opt) => {

    const {
        domain,
        port,
        node,
        jwtPass,
        expire,
    } = opt;

    let {
        cluster,
        aesPass,
    } = opt;

    if ( typeof aesPass !== 'string' ) {

        log.t(`aesPass is not a string`);

        throw th(`aesPass is not a string`);
    }

    aesPass = aesPass.trim();

    if ( ! aesPass ) {

        log.t(`aesPass is an empty string`);

        throw th(`aesPass is an empty string`);
    }

    const aes           = aes256(aesPass);

    const encoder       = data => aes.encrypt(JSON.stringify(data));

    const decoder       = json => {

        let decoded;

        if (json && json.payload) {

            try {

                decoded = aes.decrypt(json.payload);

                try {

                    decoded = JSON.parse(decoded);
                }
                catch (e) {

                    return {
                        'catch': th(`couldn't parse json after successful decoding response aes256 payload: `+ decoded)
                    }
                }

                return {
                    then: decoded
                };
            }
            catch (e) {

                return {
                    'catch': th(`couldn't decode response aes256 payload: `+ json.payload)
                }
            }
        }

        return {
            'catch': th(`no json payload in response`)
        }
    };

    const authenticator = (url, opt) => {

        // authenticator works on fetch parameters, can change url or any of fetch parameters,
        // in this case we are adding x-jwt header

        opt.headers['x-jwt'] = jwt.sign(
            {},
            jwtPass,
            {
                // https://github.com/auth0/node-jsonwebtoken#jwtsignpayload-secretorprivatekey-options-callback
                // must be int
                expiresIn: parseInt(expire, 10)
            }
        )

        return [url, opt];
    };

    return arequest.register(register, {domain, port, cluster, node, encoder, decoder, authenticator});
};

tool.delete = arequest.delete;

module.exports = tool;