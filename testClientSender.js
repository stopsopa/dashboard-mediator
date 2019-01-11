
const path          = require('path');

const fs            = require('fs');

const express       = require('express');

const bodyParser    = require('body-parser');

const log           = require('inspc');

const config        = require('./config');

const app           = express();

const favicon = require('serve-favicon');

app.use(favicon(path.join(__dirname, 'faviconSender.ico')));

app.use(require('nlab/express/console-logger'));

/**
 * Exposing config to browser code (this server in general is just for test so it's not security issue)
 */
app.all('/config', (req, res) => res.jsonNoCache(config));

/**
 * mainly for proxy.js, but it's general purpose library
 */
app.use(require('nlab/express/extend-res'));

/**
 * serving static files
 * WARNING: static files middleware have to be after auth block
 */
(function () {

    const dir = path.resolve('./publicSender');

    // app.use((req, res, next) => {
    //
    //     const file = dir + req.url.split('?')[0];
    //
    //     if ( fs.existsSync(file) ) {
    //
    //         if ( ! req.auth ) {
    //
    //             return res.basicAuth();
    //         }
    //     }
    //
    //     next();
    // });

    app.use(express.static(dir));
}());

/**
 * serving static files
 * WARNING: static files middleware have to be after auth block
 * WARNING: NO NEED TO PROTECT STATIC FILES IN TEST SERVER
 */
// (function () {
//
//     const dir = path.resolve('./publicSender');
//
//     app.use((req, res, next) => {
//
//         const file = dir + req.url.split('?')[0];
//
//         if ( fs.existsSync(file) ) {
//
//             if ( ! req.auth ) {
//
//                 return res.basicAuth();
//             }
//         }
//
//         next();
//     });
//
//     app.use(express.static(dir));
// }());

// not important code for this example ^^^







/**
 * registerItself & mrequest both require iso-fetch in this test server
 */
require('isomorphic-fetch');

app.use(bodyParser.urlencoded({extended: false}));

app.use(bodyParser.json());

require('./libs/registerItself')({
    password    : process.env.PROTECTED_BASIC_AND_JWT,
    mediator    : config.testSenderConfig.mediator,
    thisserver  : config.testSenderConfig.thisserver,
});

/**
 * test controller for sending requests through mediator to another node
 */
(function () {

    const mrequest = require('./libs/mrequest');

    mrequest.create('test', {
        domain          : config.domain,
        port            : config.port,

        thisCluster     : config.testSenderConfig.thisserver.cluster,
        thisNode        : config.testSenderConfig.thisserver.node,

        targetCluster   : config.testClientConfig.thisserver.cluster,
        targetNode      : config.testClientConfig.thisserver.node,

        aesPass         : process.env.PROTECTED_AES256,
        jwtPass         : process.env.PROTECTED_BASIC_AND_JWT,
        expire          : config.jwt.jwt_expire,
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

    const standalone_config = require('./standalone-node/config');

    app.all('/standalone-service-controller', (req, res) => {

        const {
            clientPath,
            jsonToSent,
        } = req.body;

        const cluster   = standalone_config.server.thisserver.cluster;

        const node      = standalone_config.server.thisserver.node;

        test(cluster, node, clientPath, jsonToSent)
            .then(
                json => res.jsonNoCache(json),
                e => res.status(404).jsonNoCache(e)
            )
        ;
    });
}());













// not important code for this example vvv

/**
 * Fake auth, because I need proxy.js only to generate token for further requests to mediator service
 */
app.use((req, res, next) => {
    req.auth = 'basicauth';
    next();
});
/**
 * Entire api for passing incomming request to nodes identified by cluster and node fields
 * only generating token for browser used in this case
 */
require('./middlewares/proxy')(app);

const port = config.testSenderConfig.port;

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
