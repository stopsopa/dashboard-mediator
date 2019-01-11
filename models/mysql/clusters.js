
const abstract          = require('@stopsopa/knex-abstract');

const extend            = abstract.extend;

const prototype         = abstract.prototype;

const log               = require('inspc');

const a                 = prototype.a;

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
    Regex,
    Callback,
} = require('@stopsopa/validator');

const ext = {
    // fromDb: row => {
    //
    //     if ( ! row ) {
    //
    //         return;
    //     }
    //
    //     if (typeof row.roles === 'string') {
    //
    //         row.roles = row.roles.split(',').map(r => /^\d+$/.test(r) ? parseInt(r, 10) : r);
    //     }
    //
    //     if ( ! Array.isArray(row.roles) ) {
    //
    //         row.roles = [];
    //     }
    //
    //     if (typeof row.enabled !== 'undefined') {
    //
    //         row.enabled = !!row.enabled;
    //     }
    //
    //     if (typeof row.config === 'string') {
    //
    //         try {
    //
    //             row.config = JSON.parse(row.config);
    //         }
    //         catch (e) {
    //
    //             row.config = {};
    //         }
    //     }
    //
    //     return row;
    // },
    initial: async function () {
        return {
            updated     : this.now(),
            created     : this.now(),
            port        : 80,
        }
    },
    toDb: row => {

        return row;
    },
    update: function (...args) {

        let [debug, trx, entity, id] = a(args);

        delete entity.created;

        entity.updated = this.now();

        return prototype.prototype.update.call(this, debug, trx, entity, id);
    },
    insert: async function (...args) {

        let [debug, trx, entity] = a(args);

        entity.created = this.now();

        delete entity.updated;

        const id = await prototype.prototype.insert.call(this, debug, trx, entity);

        return id;
    },
    prepareToValidate: function (data = {}, mode) {

        delete data.created;

        delete data.updated;

        return data;
    },
    getValidators: function (mode = null, id, entity) {

        const nameValidator = new Regex({
            pattern: /^https?:\/\//i,
            message: 'Domain should start from http:// or https://',
        });

        const validators = {
            id: new Optional(),
            cluster: new Required([
                new NotBlank(),
                new Length({max: 50}),
                new Callback(
                    (value, context, path, extra) =>
                        new Promise(async (resolve, reject) => {

                            const {
                                cluster,
                                node = null,
                                id,
                            } = context.rootData;

                            const condition = (node === null) ? 'is' : '=';

                            let c;

                            if (mode === 'create') {

                                c = await this.queryColumn(`select count(*) c from :table: where cluster = :cluster and node ${condition} :node`, {
                                    cluster,
                                    node,
                                });
                            }
                            else {

                                c = await this.queryColumn(`select count(*) c from :table: where cluster = :cluster and node ${condition} :node and id != :id`, {
                                    cluster,
                                    node,
                                    id,
                                });
                            }

                            const code = "CALLBACK-NOTUNIQUE";

                            if (c > 0) {

                                context
                                    .buildViolation('Not unique')
                                    .atPath(path)
                                    //.setParameter('{{ callback }}', 'not equal')
                                    .setCode(code)
                                    .setInvalidValue(`cluster: '${cluster}' and node: '${node}'`)
                                    .addViolation()
                                ;

                                if (extra && extra.stop) {

                                    return reject('reject ' + code);
                                }
                            }

                            resolve('resolve ' + code);
                        })
                ),
                nameValidator,
            ]),
            domain: new Required([
                new NotBlank(),
                new Length({max: 50}),
                new Regex({
                    pattern: /^https?:\/\//i,
                    message: 'Domain should start from http:// or https://',
                }),
            ]),
            port: new Required([
                new NotBlank(),
                new Length({max: 8}),
                new Regex(/^\d+$/),
            ]),
        };

        if (typeof entity.node !== 'undefined') {

            validators.node = new Optional();

            if (entity.node !== null) {

                validators.node = new Required([
                    new NotBlank(),
                    new Length({max: 50}),
                    nameValidator,
                ]);
            }
        }

        return new Collection(validators);
    },
    findClusters: async function (...args) {

        let [debug, trx, params] = a(args);

        let query = `select * from :table: where cluster = :cluster`;

        let {
            cluster,
            node,
        } = params;

        params = {
            cluster,
        }

        if (typeof node !== 'undefined') {

            if (node === null) {

                query += ' and node is null';
            }
            else {

                query += ' and node = :node';

                params.node = node;
            }
        }

        return await this.query(debug, trx, query, params);
    }
    // delete: async function (id, ...args) {
    //
    //     await this.clearRoles(id);
    //
    //     return await prototype.prototype.delete.call(this, id, ...args);
    // },
    // updateRoles: async function (userId, rolesIds) {
    //
    //     await this.clearRoles(userId);
    //
    //     if (Array.isArray(rolesIds)) {
    //
    //         return await Promise.all(rolesIds.map(async role_id => {
    //             return await knex.model.user_role.insert({
    //                 user_id: userId,
    //                 role_id,
    //             })
    //         }));
    //     }
    // },
    // clearRoles: async function(userId) {
    //     return await this.query(`delete from user_role where user_id = :id`, userId);
    // },
//     find: function (...args) {
//
//         let [debug, trx, id] = a(args);
//
//         if ( ! id ) {
//
//             throw `user.js::find(): id not specified or invalid`;
//         }
//
//         const data = this.raw(debug, trx, `
// SELECT          u.*, GROUP_CONCAT(r.id) roles
// FROM            users u
// LEFT JOIN       user_role ur
// 		     ON ur.user_id = u.id
// LEFT JOIN       roles r
// 		     ON ur.role_id = r.id
// WHERE           u.id = ?
// GROUP BY        u.id
// ORDER BY        id desc
//         `, [id]).then(data => {
//             return data[0][0];
//         }).then(this.fromDb);
//
//         return data;
//     },
//     findAll: function (...args) {
//
//         let [debug, trx] = a(args);
//
//         const data = this.raw(debug, trx, `
// SELECT          u.*, GROUP_CONCAT(r.name) roles
// FROM            users u
// LEFT JOIN       user_role ur
// 		     ON ur.user_id = u.id
// LEFT JOIN       roles r
// 		     ON ur.role_id = r.id
// GROUP BY        u.id
// ORDER BY        id desc
//         `).then(data => {
//             return data[0];
//         }).then(list => list.map(this.fromDb));
//
//         return data;
//     },
};

module.exports = knex => extend(
    knex,
    prototype,
    Object.assign({}, require('./abstract'), ext),
    'clusters',
    'id',
);