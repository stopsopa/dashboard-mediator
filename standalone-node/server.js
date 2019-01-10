
const path          = require('path');

const fs            = require('fs');

const bodyParser    = require('body-parser');

const log           = require('inspc');

const config        = require('./config');

const express       = require('express');

const app           = express();

app.get('/', (req, res) => {
    res.set('Content-type', 'text/html; charset=UTF-8');
    res.end(fs.readFileSync(path.resolve(__dirname, 'index.html')).toString());
});

app.use(require('nlab/express/console-logger'));

/**
 * mainly for proxy.js, but it's general purpose library
 */
app.use(require('nlab/express/extend-res'));

/**
 * registerItself & mrequest both require iso-fetch in this test server
 */
require('isomorphic-fetch');

app.use(bodyParser.urlencoded({extended: false}));

app.use(bodyParser.json());

require('@stopsopa/mediator/registerItself')({
    password    : process.env.PROTECTED_BASIC_AND_JWT,
    mediator    : config.server.mediator,
    thisserver  : config.server.thisserver,
});

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














const port = process.env.NODE_BIND_PORT;

const host = process.env.NODE_BIND_HOST;

const server = app.listen(port, host, () => {

    console.log(`\n 🌎  Server is running ` + ` ${host}:${port} ` + "\n")
});
