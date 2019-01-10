
const path          = require('path');

const fs            = require('fs');

const express       = require('express');

const bodyParser    = require('body-parser');

const jwt           = require('jsonwebtoken');

const log           = require('inspc');

const config        = require('./config');

const app           = express();

require('isomorphic-fetch');

const favicon = require('serve-favicon');

app.use(favicon(path.join(__dirname, 'faviconClient.ico')));


app.use(require('./libs/mresponse')(process.env.PROTECTED_AES256));



app.use(bodyParser.urlencoded({extended: false}));

app.use(bodyParser.json());

(function () {

    const aes256        = require('nlab/aes256');

    const encoder       = aes256(process.env.PROTECTED_AES256);

    app.use((req, res, next) => {

        if ( req.get('x-mediator') !== 'true' ) {

            return next();
        }

        if (req.body && typeof req.body.payload === 'string') {

            try {

                let decoded = encoder.decrypt(req.body.payload);

                try {

                    decoded = JSON.parse(decoded);
                }
                catch (e) {

                    log.t(`parsing json after aes256 error`);

                    return res.jsonError(`parsing json after aes256 error`);
                }

                req.body = decoded;
            }
            catch (e) {

                log.t(`decrypting aes256 error`);

                return res.jsonError(`decrypting aes256 error`);
            }
        }
        else {

            log.t(`x-mediator is present but there is no encoded payload`);

            return res.jsonError(`x-mediator is present but there is no encoded payload`);
        }

        return next();
    });
}());

app.all('/path', (req, res) => {
    return res.aes({
        part_of_data: req.body
    });
});

(function () {

    var auth = require('basic-auth');

    app.use((req, res, next) => {

        // if (/^\/admin/.test(req.url)) {
        //
        //     var credentials = auth(req);
        //
        //     if (!credentials || credentials.name !== 'admin' || credentials.pass !== process.env.PROTECTED_BASIC_AND_JWT) {
        //
        //         res.statusCode = 401;
        //
        //         res.setHeader('WWW-Authenticate', 'Basic realm="Sign in"')
        //
        //         return res.end('Access denied');
        //     } else {
        //
        //         return next();
        //     }
        // }

        let token = req.get('x-jwt') || req.query['x-jwt'] || req.body['x-jwt'];

        if (token) {

            // to create use:
            // const token = jwt.sign(
            //     {},
            //     process.env.PROTECTED_AES256,
            //     {
            //         // https://github.com/auth0/node-jsonwebtoken#jwtsignpayload-secretorprivatekey-options-callback
            //         // must be int
            //         expiresIn: parseInt(config.jwt.jwt_expire, 10)
            //     }
            // )

            try {

                // expecting exception from method .verify() if not valid:
                // https://github.com/auth0/node-jsonwebtoken#jwtverifytoken-secretorpublickey-options-callback
                jwt.verify(token, process.env.PROTECTED_BASIC_AND_JWT);

                req.admin = 'jwt';
            }
            catch (e) { // auth based on cookie failed (any reason)

                log.t(`api: req: '${req.url}', invalid jwt token: '${e}'`);
            }
        }
        else {

            var credentials = auth(req);

            if (credentials && credentials.name === 'admin' && credentials.pass === process.env.PROTECTED_BASIC_AND_JWT) {

                req.admin = 'basicauth';
            }
        }

        next();
    });
}());

app.use(require('nlab/express/extend-res'));

app.use(require('nlab/express/console-logger'));

// serving static files
(function () {

    const dir = path.resolve('./public');

    app.use((req, res, next) => {

        const file = dir + req.url.split('?')[0];

        if ( fs.existsSync(file) ) {

            if ( ! req.admin ) {

                return res.basicAuth();
            }
        }

        next();
    });

    app.use(express.static(dir));
}());

require('./middlewares/registerItself')({
    password: process.env.PROTECTED_BASIC_AND_JWT,
    mediator: config.testClientConfig.mediator,
});

const port = config.testClientConfig.port;

const host = '0.0.0.0';

const server = app.listen(port, host, () => {

    console.log(`\n 🌎  Server is running ` + ` ${host}:${port} ` + "\n")
});

// "... The application processes have 30 seconds to shut down cleanly ..."
// from:
//      https://devcenter.heroku.com/articles/dynos#graceful-shutdown-with-sigterm
process.on('SIGTERM', function () {

    console.log('SIGTERM handler')

    server.close(function () {

        console.log('server.close callback, now exit 0')

        process.exit(0);
    });
});
