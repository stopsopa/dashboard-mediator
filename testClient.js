
const path          = require('path');

const fs            = require('fs');

const express       = require('express');

const bodyParser    = require('body-parser');

const log           = require('inspc');

const config        = require('./config');

const app           = express();

const favicon = require('serve-favicon');

app.use(favicon(path.join(__dirname, 'faviconClient.ico')));

app.use(require('nlab/express/console-logger'));

app.all('/', (req, res) => res.end('no need for front api in this test server'));

// not important code for this example ^^^












/**
 * only registerItself require iso-fetch in this test server
 */
require('isomorphic-fetch');

require('./middlewares/registerItself')({
    password: process.env.PROTECTED_BASIC_AND_JWT,
    mediator: config.testClientConfig.mediator,
});

/**
 * Middleware to provide res.aes({}) method to return encrypted JSON responses to mediator service
 */
app.use(require('./libs/mresponse')(process.env.PROTECTED_AES256));

app.use(bodyParser.urlencoded({extended: false}));

app.use(bodyParser.json());

/**
 * Decoding entire encoded json for next regular middlewares
 * The only requirements is that those middlewares should use res.aes() method to return response
 */
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

/**
 * Test endpoint after decoding encrypted body for manual testing
 *
 * WARNING: No need to implement any auth, encoded json works like authentication.
 */
app.all('/path/:rest(*)?', (req, res) => {

    return res.aes({
        response_from_client: {
            request_body: req.body,
            request_full_url: req.url,
            request_url_param_rest: req.params.rest
        }
    });
});







// not important code for this example vvv

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
