
const isObject              = require('nlab/isObject');

const aes256                = require('nlab/aes256');

const log                   = require('inspc');

const mabstract             = require('./mresponse-abstract');

const th                    = msg => `mresponse.js: ` + msg;

/**
 * Extension of mresponse-abstract.js that provide specific encryption method
 * in this case aes256 encryption and jwt authentication
 *
 * @param opt
 */
module.exports = opt => {

    if ( ! isObject(opt) ) {

        log.t(th(`opt is not an object`));

        throw th(`opt is not an object`);
    }

    const {
        header,
        app,
    } = opt;

    let {
        aesPass,
    } = opt;

    if ( typeof aesPass !== 'string' ) {

        log.t(th(`aesPass is not a string`));

        throw th(`aesPass is not a string`);
    }

    aesPass = aesPass.trim();

    if ( ! aesPass ) {

        log.t(th(`aesPass is empty string`));

        throw th(`aesPass is empty string`);
    }

    const aes           = aes256(aesPass);

    return mabstract({
        encoder: obj => aes.encrypt(JSON.stringify(obj)),
        decoder: str => {

            let decoded;

            try {

                decoded = aes.decrypt(str);
            }
            catch (e) {

                log.t(th(`aes256 decryption error`));

                throw th(`aes256 decryption error`);
            }

            try {

                decoded = JSON.parse(decoded);
            }
            catch (e) {

                log.t(th(`parsing json after aes256 error`));

                throw th(`parsing json after aes256 error`);
            }

            return decoded;
        },
        app,
        header,
    });
}