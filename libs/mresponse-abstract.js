
const isObject              = require('nlab/isObject');

const log                   = require('inspc');

const th                    = msg => `mresponse-abstract.js: ` + msg;

/**
 * This is express middleware which means that it have to be used like this:
 *
    const app = express();

    require('./libs/mresponse')({
        aesPass: process.env.PROTECTED_AES256,
        app,
    });

 * This abstract layer is isolated to separate file in order to provide encryption agnostic library
 * If there is need to specify custom encryption then you have to extend this object
 * like it is done in mresponse.js
 */
module.exports = opt => {

    if ( ! isObject(opt) ) {

        log.t(th(`opt is not an object`));

        throw th(`opt is not an object`);
    }

    const {
        encoder,
        decoder,
        app,
    } = opt;

    let {
        header = 'x-mediator',
    } = opt;

    if ( typeof encoder !== 'function' ) {

        log.t(th(`encoder is not a function`));

        throw th(`encoder is not a function`);
    }

    if ( typeof decoder !== 'function' ) {

        log.t(th(`decoder is not a function`));

        throw th(`decoder is not a function`);
    }

    // if ( ! isObject(app) ) {
    if ( typeof app !== 'function' ) {

        // it looks like app is a function

        log.t(th(`app is not a function`));

        throw th(`app is not a function`);
    }

    if ( typeof header !== 'string' ) {

        log.t(th(`header is not a string`));

        throw th(`header is not a string`);
    }

    header = header.trim();

    if ( ! header ) {

        log.t(th(`header is an empty string`));

        throw th(`header is an empty string`);
    }

    app.use(function (req, res, next) {

        if ( ! res.constructor.prototype.aesextended ) {

            res.constructor.prototype.aesextended = true;

            res.constructor.prototype.jsonNoCache = function (json) {
                return this.set({
                    'Cache-Control' : 'no-store, no-cache, must-revalidate',
                    'Pragma'        : 'no-cache',
                    'Content-type'  : 'application/json; charset=utf-8',
                    'Expires'       : new Date().toUTCString(),
                }).json(json);
            }

            res.constructor.prototype.aes = function (obj) {
                return this.jsonNoCache({
                    payload: encoder(obj)
                });
            }
        }

        next();
    });

    app.use(function (req, res, next) {

        if ( typeof req.get(header) === 'undefined' ) {

            return next();
        }

        if (req.body && typeof req.body.payload === 'string') {

            try {

                req.body = decoder(req.body.payload);
            }
            catch (e) {

                log.t(`decrypting error: ` + e);

                return res.jsonError(`decrypting error: ` + e);
            }
        }
        else {

            log.t(th(`${header} is present but there is no encoded payload`));

            return res.jsonError(`${header} is present but there is no encoded payload`);
        }

        return next();
    });
}