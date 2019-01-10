
require('@stopsopa/dotenv-up')(1, false, 'config.js');

module.exports = {
    jwt: {
        // in seconds (in this case 9 hours)
        jwt_expire: process.env.PROTECTED_JWT_EXPIRE,
    },
    server: {
        mediator: {
            domain: process.env.MEDIATOR_SERVICE_DOMAIN,
            port: process.env.MEDIATOR_SERVICE_PORT,
            registrationInterval: 15 * 60 * 1000, // 2 min - not more than hour
            plusMinus: 15 * 1000, // 15 sec
            // in seconds (in this case 9 hours)
            jwt_expire: process.env.PROTECTED_JWT_EXPIRE,
        },
        thisserver: {
            cluster: process.env.THIS_CLUSTER,
            node: process.env.THIS_NODE, // can be null
            domain: process.env.THIS_PUBLIC_DOMAIN,
            port: process.env.THIS_PUBLIC_PORT, // ... another thing is to tell outside world how to reach this server
        },
    }

};
