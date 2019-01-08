
const isObject      = require('nlab/isObject');

const aes256        = require('nlab/aes256');

const knex          = require('@stopsopa/knex-abstract');

const log           = require('inspc');

const validator     = require('@stopsopa/validator');

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

    app.all('/register', async (req, res) => {

        let entity              = req.body;

        let id                  = entity.id;

        const mode              = id ? 'edit' : 'create';

        const man               = knex().model.clusters;

        const validators        = man.getValidators(mode, id, entity);

        if (mode === 'create') {

            entity = {
                ...man.initial(),
                ...entity,
            };
        }

        const entityPrepared    = man.prepareToValidate(entity, mode);

        const errors            = await validator(entityPrepared, validators);

        if ( ! errors.count() ) {

            try {

                if (mode === 'edit') {

                    await man.update(entityPrepared, id);
                }
                else {

                    id = await man.insert(entityPrepared);
                }

                entity = await man.find(id);

                if ( ! entity ) {

                    return res.jsonError("Database state conflict: updated/created entity doesn't exist");
                }
            }
            catch (e) {

                log.dump(e);

                return res.jsonError(`Can't register: ` + JSON.stringify(req.body) + ', reason: ' + e.e);
            }
        }

        return res.jsonNoCache({
            entity: entity,
            errors: errors.getTree(),
        });

    });

    app.all('/proxy', (req, res) => {

        res.json({
            pass: opt,
        })
    });
}