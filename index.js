
const path = require('path');

const express = require('express');

const bodyParser = require('body-parser');

const config = require('./config');

const app = express();

const favicon = require('serve-favicon');

app.use(favicon(path.join(__dirname, 'favicon.ico')))

app.use(bodyParser.urlencoded({extended: false}));

app.use(bodyParser.json());

app.all('/test', (req, res) => {

    return res.json({
        body: req.body,
        query: req.query,
        node: process.version,
    })
});

const port = config.port;

const host = '0.0.0.0';

const server = app.listen(port, host, () => {

    console.log(`\n 🌎  Server is running ` + ` ${host}:${port} ` + "\n")
});

process.on('SIGTERM', function () {

    console.log('SIGTERM handler')

    server.close(function () {

        console.log('server.close callback, now exit 0')

        process.exit(0);
    });
});
