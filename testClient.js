
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

require('./libs/registerItself')({
    password    : process.env.PROTECTED_BASIC_AND_JWT,
    mediator    : config.testClientConfig.mediator,
    thisserver  : config.testClientConfig.thisserver,
});


app.use(bodyParser.urlencoded({extended: false}));

app.use(bodyParser.json());

/**
 * Middleware to provide res.aes({}) method to return encrypted JSON responses to mediator service
 * and to decode incoming request to pass it to regular routes
 */
require('./libs/mresponse')({
    aesPass: process.env.PROTECTED_AES256,
    app,
});

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
            request_url_param_rest: req.params.rest,
            request_query_params: req.query,
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
