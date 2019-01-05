
require('@stopsopa/dotenv-up')(1, true, 'config.js');

module.exports = {
    port: process.env.PORT || process.env.NODE_PORT,
};

