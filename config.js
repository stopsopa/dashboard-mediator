
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
    database    = t.pathname.substring(1);

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

module.exports = {
    port: process.env.PORT || process.env.NODE_PORT,
    mysql: {
        host,
        port,
        user,
        password,
        database,
    },
};

