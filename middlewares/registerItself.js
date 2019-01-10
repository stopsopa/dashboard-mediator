
const random        = require('lodash/random');

const log           = require('inspc');

const jwt           = require('jsonwebtoken');

const validator     = require('@stopsopa/validator');

const {
    Collection,
    All,
    Required,
    Optional,
    NotBlank,
    Length,
    Email,
    Type,
    IsTrue,
    IsNull,
    Regex,
    Callback,
} = validator;

const th            = msg => `registerItself.js: ` + msg;

/**
 *
    require('./middlewares/registerItself')({
        password    : process.env.PROTECTED_BASIC_AND_JWT,
        mediator    : {
            domain: 'http://localhost',
            port: 4567,
            registrationInterval: 15 * 60 * 1000, // 15 min - not more than hour
            plusMinus: 15 * 1000, // 15 sec
            // in seconds (in this case 9 hours)
            jwt_expire: 32400,
        },
        thisserver  : {
            cluster: 'dashboard',
            node: 'test-client', // can be null
            domain: 'http://localhost',
            port: 6789, // ... another thing is to tell outside world how to reach this server
        },
    });
 */
module.exports = async opt => {

    const {
        password,
        mediator,
        thisserver,
    } = opt;

    try {

        const b = new NotBlank();
        const d = new Regex(/^\d+$/);
        const s = new Type('string', 'int');
        const u = new Regex(/^https?:\/\//);

        const nullablePort = port => {

            if (port === null) {

                return new IsNull();
            }

            return [b, d];
        }

        const nullableNode = port => {

            if (port === null) {

                return new IsNull();
            }

            return [b, s];
        }

        const validators = new Collection({
            password                    : new Required([b, s]),
            mediator                    : new Collection({
                domain                  : new Required([b, u]),
                port                    : new Optional(nullablePort(mediator.port)),
                registrationInterval    : new Required([b, d]),
                plusMinus               : new Required([b, d]),
                jwt_expire              : new Required([b, d]),
            }),
            thisserver                  : new Collection({
                cluster                 : new Required([b, s]),
                node                    : new Optional(nullableNode(thisserver.node)),
                domain                  : new Required([b, u]),
                port                    : new Optional(nullablePort(thisserver.port)),
            }),
        });

        const errors            = await validator(opt, validators);

        if ( errors.count() ) {

            throw th(JSON.stringify({
                errors,
                opt,
            }, null, 4));
        }
        const hour = 60 * 60 * 1000;

        if (mediator.registrationInterval > hour) {

            throw th(`mediator.registrationInterval can't be bigger than an hour (${hour} ms) and is: ${mediator.registrationInterval}`);
        }
    }
    catch (e) {

        log.dump(e, 4);

        process.exit(1);
    }

    let domain = mediator.domain;

    if (mediator.port && mediator.port != 80) {

        domain += ':' + mediator.port;
    }

    domain += '/register';

    function register() {

        fetch(domain, {
            method: 'post',
            headers: {
                'Content-type': 'application/json; charset=utf-8',
                'x-jwt': jwt.sign(
                    {},
                    password,
                    {
                        // https://github.com/auth0/node-jsonwebtoken#jwtsignpayload-secretorprivatekey-options-callback
                        // must be int
                        expiresIn: parseInt(mediator.jwt_expire, 10)
                    }
                )
            },
            body: JSON.stringify({
                cluster : thisserver.cluster,
                node    : thisserver.node || null,
                domain  : thisserver.domain,
                port    : thisserver.port || 80,
            })
        })
            .then(res => res.json())
            .then(json => {

                if ( ! json || ! json.errors || Object.keys(json.errors).length > 0) {

                    log.dump({
                        'registration failed': json,
                    }, 5);
                }

                again();
            })
            .catch(e => {

                log.dump({
                    'catch': e
                }, 4)

                again();
            })
        ;
    };

    function again() {

        const sec       = mediator.plusMinus / 1000;

        const randSec   = random(
            -sec,
            sec,
            false
        );

        const interval = mediator.registrationInterval + (randSec * 1000);

        console.log(th(
            `register: cluster: '` +
            thisserver.cluster +
            `' node: '` +
            (thisserver.node ? thisserver.node : '[null]') +
            `' to domain: ` +
            domain +
            `, next after: ` +
            (interval / 60 / 1000 ).toFixed(2) +
            ` min`
        ));

        setTimeout(
            register,
            interval,
        );
    }

    register();
}