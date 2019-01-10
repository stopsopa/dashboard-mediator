
const aes256                = require('nlab/aes256');

const mabstract             = require('./mresponse-abstract');

const th                    = msg => `mresponse.js: ` + msg;

module.exports = aesPass => {

    if ( typeof aesPass !== 'string' ) {

        throw th(`aesPass is not a string`);
    }

    aesPass = aesPass.trim();

    if ( ! aesPass ) {

        throw th(`aesPass is empty string`);
    }

    const aes           = aes256(aesPass);

    return mabstract(obj => aes.encrypt(JSON.stringify(obj)));
}