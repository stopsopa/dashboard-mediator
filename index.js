
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

app.use(bodyParser.urlencoded({
    extended: true
}));

app.use(bodyParser.json());

app.use(function (req, res, next) {
    res.removeHeader("X-Powered-By");
    next();
});

app.use((req, res, next) => {
    res.set('Access-Control-Allow-Origin', '*');
    next();
});

(function () {

    // var auth = require('basic-auth');

    app.use((req, res, next) => {

        if (req.auth) {

            return next();
        }

        let token = req.get('x-jwt') || req.query['x-jwt'] || req.body['x-jwt'];

        if (token) {

            // to create use:
            // const token = jwt.sign(
            //     {},
            //     process.env.PROTECTED_BASIC_AND_JWT,
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

                req.auth = 'jwt';
            }
            catch (e) { // auth based on cookie failed (any reason)

                log.t(`api: req: '${req.url}', invalid jwt token: '${e}'`);
            }
        }
        // else {
        //
        //     var credentials = auth(req);
        //
        //     if (credentials && credentials.name === 'admin' && credentials.pass === process.env.PROTECTED_BASIC_AND_JWT) {
        //
        //         req.auth = 'basicauth';
        //     }
        // }

        next();
    });
}());

// (function (i) {
//     app.use((req, res, next) => {
//         console.log(req.method+':'+(i++)+':'+req.url+':'+req.get('Authorization'));
//         next();
//     });
// }(0));

const security = require('secure-express');

const middlewares = security({
    debug: true,
    secret: process.env.PROTECTED_BASIC_AND_JWT,
    userprovider: async (username, opt) => {

        const users = [
            {
                username: 'admin',
                password: process.env.PROTECTED_BASIC_AND_JWT,
                // jwtpayload: {
                //     username: 'admin',
                //     role: 'admin'
                // }
            },
            {
                username: 'abc',
                password: 'def',
                // jwtpayload: {
                //     username: 'admin',
                //     role: 'user'
                // }
            },
        ];

        return users.find(u => u.username === username);
    },
    authenticate: async (user = {}, password, opt) => {
        return user.password === password;
    },
    extractpayloadfromuser: async (user, opt) => {
        return user.jwtpayload || {};
    },
});

app.use(middlewares.secure);

app.use('/signout', middlewares.signout);

app.use(require('nlab/express/extend-res'));

require('./middlewares/proxy')(app);

// app.use(require('nlab/express/console-logger'));
/**
 * have to be after proxy.js, look for phrase 'clilogged' in the project to understand why
 */
(function (logger) {
    app.use((req, res, next) => {
        if (
            req.clilogged ||
            (req.url.indexOf('/public/') === 0 && req.url.split('.html').pop() !== '')
        ) { // ignore all public

            return next();
        }

        return logger(req, res, next);
    });
}(require('nlab/express/console-logger')));

// serving static files
(function () {

    const dir = path.resolve('./public');

    app.use((req, res, next) => {

        const file = dir + req.url.split('?')[0];

        if ( fs.existsSync(file) ) {

            if ( ! req.auth ) {

                return res.accessDenied(req);
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
