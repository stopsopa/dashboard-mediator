
const th                    = msg => `mresponse-abstract.js: ` + msg;
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
module.exports = encoder => {

    if ( typeof encoder !== 'function' ) {

        throw th(`encoder is not a function`);
    }

    return function (req, res, next) {

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
    };
}