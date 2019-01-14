
const path          = require('path');

const fs            = require('fs');

const bodyParser    = require('body-parser');

const log           = require('inspc');

const config        = require('./config');

const express       = require('express');

const app           = express();

/**
 * Simple way to serve only index.html
 */
app.get('/', (req, res) => {
    res.set('Content-type', 'text/html; charset=UTF-8');
    res.end(fs.readFileSync(path.resolve(__dirname, 'index.html')).toString());
});

/**
 * This middleware is just loggin incoming requests ruls to local terminal
 */
app.use(require('nlab/express/console-logger'));

/**
 * mainly for proxy.js, but it's general purpose library.
 * It's middleware that adds few methods to response object, like:
 *      res.jsonNoCache({...})
 *      or
 *      res.accessDenied(message)
 */
app.use(require('nlab/express/extend-res'));

/**
 * registerItself & mrequest both require iso-fetch on this test server
 */
require('isomorphic-fetch');

app.use(bodyParser.json());





// just common code for both types of services: listening and sending traffic ============== vvv

require('@stopsopa/mediator/registerItself')({
    password    : process.env.PROTECTED_BASIC_AND_JWT,
    mediator    : config.server.mediator,
    thisserver  : config.server.thisserver,
});
// just common code for both types of services: listening and sending traffic ============== ^^^







// to be able to receive traffic =========================================================== vvv
/**
 * Middleware to provide res.aes({}) method to return encrypted JSON responses to mediator service
 * and to decode incoming request to pass it to regular routes
 */
require('@stopsopa/mediator/mresponse')({
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
            request_body: {
                ...req.body,
                ...{
                    added_by: 'standalone-server'
                }
            },
            request_full_url: req.url,
            request_url_param_rest: req.params.rest,
            request_query_params: req.query,
            ".env": {
                THIS_CLUSTER: process.env.THIS_CLUSTER,
                THIS_NODE: process.env.THIS_NODE,
                TARGET_CLUSTER: process.env.TARGET_CLUSTER,
                TARGET_NODE: process.env.TARGET_NODE,
                MEDIATOR_SERVICE_DOMAIN: process.env.MEDIATOR_SERVICE_DOMAIN,
                MEDIATOR_SERVICE_PORT: process.env.MEDIATOR_SERVICE_PORT,
            }
        }
    });
});

// to be able to receive traffic =========================================================== ^^^



// test of sending traffic to other services================================================ vvv
/**
 * test controller for sending requests through mediator to another node
 */
(function () {

    const mrequest = require('@stopsopa/mediator/mrequest');

    mrequest.create('test', {
        domain          : process.env.MEDIATOR_SERVICE_DOMAIN,
        port            : process.env.MEDIATOR_SERVICE_PORT,

        thisCluster     : process.env.THIS_CLUSTER,
        thisNode        : process.env.THIS_NODE,

        targetCluster   : process.env.TARGET_CLUSTER,
        targetNode      : process.env.TARGET_NODE,

        aesPass         : process.env.PROTECTED_AES256,
        jwtPass         : process.env.PROTECTED_BASIC_AND_JWT,
        expire          : process.env.PROTECTED_JWT_EXPIRE,
    });

    const test = mrequest('test'); // get connection by local reference name

    app.all('/sender-service-controller', (req, res) => {

        const {
            clientPath,
            jsonToSent,
        } = req.body;

        test(clientPath, jsonToSent)
            .then(
                json => res.jsonNoCache(json),
                e => res.status(404).jsonNoCache(e)
            )
        ;
    });
}());
// test of sending traffic to other services================================================ ^^^














const port = process.env.NODE_BIND_PORT;

const host = process.env.NODE_BIND_HOST;

const server = app.listen(port, host, () => {

    console.log(`\n 🌎  Server is running ` + ` ${host}:${port} ` + "\n")
});
