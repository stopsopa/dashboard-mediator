
const path = require('path');

const express = require('express');

const bodyParser = require('body-parser');

const config = require('./config');

const app = express();

require('isomorphic-fetch');

const favicon = require('serve-favicon');

app.use(favicon(path.join(__dirname, 'favicon.ico')))

app.use(bodyParser.urlencoded({extended: false}));

app.use(bodyParser.json());

(function () {

    var auth = require('basic-auth');

    app.use((req, res, next) => {

        if (/^\/admin/.test(req.url)) {

            var credentials = auth(req);

            if (!credentials || credentials.name !== 'admin' || credentials.pass !== process.env.PROTECTED_ADMIN_PASS) {

                res.statusCode = 401;

                res.setHeader('WWW-Authenticate', 'Basic realm="Sign in"')

                return res.end('Access denied');
            } else {

                return next();
            }
        }

        next();
    });
}());

app.use(require('nlab/express/extend-res'));

app.use(require('nlab/express/console-logger'));

const knex              = require('@stopsopa/knex-abstract');

const log               = require('@stopsopa/knex-abstract/log/logn');

knex.init(require('./models/config'));


app.all('/test', require('./middlewares/test'));

require('./middlewares/keep-awake')(app);

require('./middlewares/proxy')({
    password: process.env.PASSWORD,
    app,
});

const port = config.port;

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
