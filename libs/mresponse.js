
const isObject              = require('nlab/isObject');

const th                    = msg => `mresponse.js: ` + msg;
/**
 * This is express middleware which means that it have to be used like this:
 *
 const app = express();

 app.use(require('nlab/express/extend-res'));

 app.all((req, res) => {

    res.aes({ // instead of res.json({})
        data: "value"
    });
 });

 * @param req
 * @param res
 * @param next
 */
module.exports = (opt = {}) => {

    if ( ! isObject(opt) ) {

        throw th(`opt is not an object`);
    }

    opt = Object.assign({

    }, opt);

    return function (req, res, next) {

        if ( ! res.constructor.prototype.aesextended ) {

            res.constructor.prototype.aesextended = true;

            res.constructor.prototype.aes = function (obj) {
                return this.set({
                    'Cache-Control' : 'no-store, no-cache, must-revalidate',
                    'Pragma'        : 'no-cache',
                    'Content-type'  : 'application/json; charset=utf-8',
                    'Expires'       : new Date().toUTCString(),
                }).json(json);

                return this.status(409).jsonNoCache({
                    error: errstring
                });
            }
        }

        next();
    };
}