
const express = require('express');

const bodyParser = require('body-parser');

const app = express();

const config = require('./config');

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

    console.log('one')

    server.close(function () {

        console.log('two')

        process.exit(12);
    });
});
