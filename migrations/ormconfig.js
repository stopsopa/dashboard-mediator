
const mainconfig = require('../config');

const config = {
   "type": "mysql",
   "host": mainconfig.mysql.host,
   "port": mainconfig.mysql.port,
   "username": mainconfig.mysql.user,
   "password": mainconfig.mysql.password,
   "database": mainconfig.mysql.database,
   "synchronize": false,
   "logging": false,
   // "logging": "query", // "query", "error", "schema"
   "exclude": [
      "node_modules"
   ],
   // "migrationsTableName": "migration_versions",
   "entities": [
      "src/entity/**/*.ts"
   ],
   "migrations": [
      "src/migration/**/*.ts"
   ],
   "subscribers": [
      "src/subscriber/**/*.ts"
   ],
   "cli": {
      "entitiesDir": "src/entity",
      "migrationsDir": "src/migration",
      "subscribersDir": "src/subscriber"
   }
}

module.exports = config;
