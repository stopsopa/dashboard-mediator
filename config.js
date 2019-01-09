
require('@stopsopa/dotenv-up')(1, false, 'main config.js');

// const url = require('url');
//
// const t = `mysql://username:password@us-cdbr-iron-east-01.cleardb.net/database_name?reconnect=true`;
//
// console.log(t)
//
// console.log(url.parse(t));
//
// will return:
//
// Url {
//     protocol: 'mysql:',
//     slashes: true,
//     auth: 'username:password',
//     host: 'us-cdbr-iron-east-01.cleardb.net',
//     port: null,
//     hostname: 'us-cdbr-iron-east-01.cleardb.net',
//     hash: null,
//     search: '?reconnect=true',
//     query: 'reconnect=true',
//     pathname: '/database_name',
//     path: '/database_name?reconnect=true',
//     href: 'mysql://username:password@us-cdbr-iron-east-01.cleardb.net/database_name?reconnect=true'
// }

let host        = process.env.PROTECTED_MYSQL_HOST;
let port        = process.env.PROTECTED_MYSQL_PORT;
let user        = process.env.PROTECTED_MYSQL_USER;
let password    = process.env.PROTECTED_MYSQL_PASS;
let database    = process.env.PROTECTED_MYSQL_DB;

if (process.env.CLEARDB_DATABASE_URL) {

    // console.log("CLEARDB_DATABASE_URL is defined");

    const t = require('url').parse(process.env.CLEARDB_DATABASE_URL);

    host = t.host;
    port = '3306' // standard port

    const auth  = t.auth.split(':');

    user        = auth[0];
    password    = auth[1];
    database    = t.pathname.substring(1); // remofe leading slash

}
else {

    // console.log("CLEARDB_DATABASE_URL is NOT defined");
}

if ( ! host ) {

    throw `host is empty`
}

if ( ! port ) {

    throw `port is empty`
}

if ( ! user ) {

    throw `user is empty`
}

if ( ! password ) {

    throw `password is empty`
}

if ( ! database ) {

    throw `database is empty`
}

if ( ! process.env.PASSWORD ) {

    throw `process.env.PASSWORD is not defined`
}

if ( ! process.env.PROTECTED_ADMIN_PASS ) {

    throw `process.env.PROTECTED_ADMIN_PASS is not defined`
}

if ( ! process.env.PORT && ! process.env.NODE_PORT ) {

    throw `no process.env.PORT nor process.env.NODE_PORT are defined`
}

const mainPort = process.env.PORT || process.env.NODE_PORT;

const testClientPort = 8090;

module.exports = {
    port: mainPort,
    jwt: {
        // in seconds (in this case 9 hours)
        jwt_expire: 32400,
    },
    mysql: {
        host,
        port,
        user,
        password,
        database,
    },
    testClientConfig: {

        // this config (testClientConfig section) is for testClient.js script,
        // it used only for debugging,
        // no need to configure it on production

        port: testClientPort, // one thing is to tell where to bind server internally...
        mediator: {
            domain: 'http://localhost',
            port: mainPort,
            registrationInterval: 2 * 60 * 1000, // 2 min - not more than hour
            plusMinus: 15 * 1000, // 15 sec
            thisserver: {
                cluster: 'dashboard',
                node: 'test-local-node', // can be null
                domain: 'http://localhost',
                port: testClientPort, // ... another thing is to tell outside world how to reach this server
            },
            // in seconds (in this case 9 hours)
            jwt_expire: 32400,
        }
    }
};

