
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

app.use(favicon(path.join(__dirname, 'favicon.ico')))

app.use(bodyParser.urlencoded({extended: false}));

app.use(bodyParser.json());

(function () {

    var auth = require('basic-auth');

    app.use((req, res, next) => {

        // if (/^\/admin/.test(req.url)) {
        //
        //     var credentials = auth(req);
        //
        //     if (!credentials || credentials.name !== 'admin' || credentials.pass !== process.env.PROTECTED_ADMIN_PASS) {
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
            //     process.env.PASSWORD,
            //     {
            //         // https://github.com/auth0/node-jsonwebtoken#jwtsignpayload-secretorprivatekey-options-callback
            //         // must be int
            //         expiresIn: parseInt(config.jwt.jwt_expire, 10)
            //     }
            // )

            try {

                // expecting exception from method .verify() if not valid:
                // https://github.com/auth0/node-jsonwebtoken#jwtverifytoken-secretorpublickey-options-callback
                jwt.verify(token, process.env.PASSWORD);

                req.admin = 'jwt';
            }
            catch (e) { // auth based on cookie failed (any reason)

                log.t(`api: req: '${req.url}', invalid jwt token: '${e}'`);
            }
        }
        else {

            var credentials = auth(req);

            if (credentials && credentials.name === 'admin' && credentials.pass === process.env.PROTECTED_ADMIN_PASS) {

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

const knex              = require('@stopsopa/knex-abstract');

knex.init(require('./models/config'));


app.all('/ping', require('./middlewares/ping'));

require('./middlewares/keep-awake')(app);

require('./middlewares/proxy')(app);

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
