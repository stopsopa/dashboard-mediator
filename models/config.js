
const mainconfig = require('../config');

const mysql = require('./mysql');

module.exports = {
    def: 'mysql',
    // sqlite: {
    //     client: 'sqlite3',
    //     connection: {
    //         filename: path.resolve(__dirname, '..', 'db.sqlite')
    //     },
    //     debug: !isProd,
    //     asyncStackTraces: !isProd, // https://knexjs.org/#Installation-asyncStackTraces
    //     useNullAsDefault: true,
    // }
    mysql: {
        // CREATE DATABASE IF NOT EXISTS `dashboard` /*!40100 DEFAULT CHARACTER SET utf8 */
        // GRANT ALL PRIVILEGES ON dashboard.* To 'dashboard'@'%' IDENTIFIED BY 'pass';
        // SHOW GRANTS FOR 'dashboard';
        // DROP USER 'dashboard'
        client: 'mysql',
        connection: mainconfig.mysql,
        models: mysql,
    },
    // test: {
    //     // CREATE DATABASE IF NOT EXISTS `dashboard` /*!40100 DEFAULT CHARACTER SET utf8 */
    //     // GRANT ALL PRIVILEGES ON dashboard.* To 'dashboard'@'%' IDENTIFIED BY 'pass';
    //     // SHOW GRANTS FOR 'dashboard';
    //     // DROP USER 'dashboard'
    //     client: 'mysql',
    //     connection: {
    //         host        : process.env.PROTECTED_TEST_MYSQL_HOST,
    //         user        : process.env.PROTECTED_TEST_MYSQL_USER,
    //         password    : process.env.PROTECTED_TEST_MYSQL_PASS,
    //         database    : process.env.PROTECTED_TEST_MYSQL_DB,
    //     }
    // }
};