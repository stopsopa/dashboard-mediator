
const isObject = require('nlab/isObject');

const aes256   = require('nlab/aes256');

module.exports = opt => {

    if ( ! isObject(opt) ) {

        throw `proxy.js: opt is not an object`;
    }

    let {
        password,
        app,
    } = opt;

    if ( typeof password !== 'string' ) {

        throw `opt.password is not string`
    }

    password = password.trim();

    if ( typeof password !== 'string' ) {

        throw `opt.password is string but it's empty`
    }

    const enc = aes256(password);

    app.all('/register', (req, res) => {

        const cluster   = req.body.cluster;

        const node      = req.body.node;
    });

    app.all('/proxy', (req, res) => {

        res.json({
            pass: opt,
        })
    });
}