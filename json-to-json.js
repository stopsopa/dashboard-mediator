
const path      = require('path');

const fs        = require('fs');

const log       = require('inspc');

function isObject(obj) {
    return Object.prototype.toString.call(obj) === '[object Object]';
};

function isArray(obj) {
    return Object.prototype.toString.call(obj) === '[object Array]';
};

/**
 * from: https://github.com/stopsopa/validator/blob/master/validator/utils/get.js
 * @param source
 * @param key
 * @returns {*}
 */
const get       = function (source, key) {

    // log('key', key);
    // log('source', source)

    if ( ! key ) {

        return source;
    }

    if (typeof key === 'string' && key.indexOf('.') > -1) {

        key = key.split('.');
    }

    if ( ! isArray(key)) {

        key = [key];
    }

    let tmp = source, k;

    while (k = key.shift()) {

        try {
            if (key.length) {

                tmp = tmp[k];
            }
            else {

                if (typeof tmp[k] === 'undefined') {

                    return arguments[2];
                }

                return tmp[k];
            }
        }
        catch (e) {

            return arguments[2];
        }
    }
}

/**
 * from: https://github.com/stopsopa/validator/blob/master/validator/utils/set.js
 * @param source
 * @param key
 * @param value
 * @returns {*}
 */
const set       = function set(source, key, value) {

    if (typeof key === 'string') {

        key = key.split('.');
    }

    if (typeof key === 'number') {

        key = key + '';
    }

    if ( isObject(key) ) {

        key = Object.values(key).map(a => a += '');
    }

    if (typeof key !== 'string' && ! key && key !== '0' && key !== '') {

        key = [];
    }

    if ( ! isArray(key) ) {

        key = [key];
    }

    if (key.length) {

        let first = true;

        let ar = isArray(source);

        if ( ! ar && ! isObject(source) ) {

            source = {};
        }

        let kt;

        let tmp     = source;

        let tmp2    = source;

        let obb, arr;

        while (key.length) {

            kt = key.shift();

            if (first) {

                first = false;

                if ( ar && !/^\d+$/.test(kt) && kt !== '') {

                    throw `if source is array and key is not integer nor empty string then its not possible to add to array, given key: ` + JSON.stringify(kt)
                }
            }

            tmp = tmp2;

            if ( key.length ) {

                obb = isObject(tmp[kt]);

                arr = isArray(tmp[kt]);

                if ( ! ( obb || arr ) ) {

                    if (key[0] === '') {

                        arr || (tmp[kt] = []);
                    }
                    else {

                        obb || (tmp[kt] = {});
                    }
                }

                tmp2 = tmp[kt];
            }
            else {

                if (isArray(tmp)) {

                    if (kt === '') {

                        tmp.push(value);
                    }
                    else {

                        tmp[kt] = value
                    }
                }
                else {

                    tmp[kt] = value;
                }

                return source;
            }
        }
    }

    return value;
}

if (process.argv.length < 6) {

    throw `process.argv.length < 6`;
}

const from      = path.resolve(__dirname, process.argv[2]);

const fromKey   = process.argv[3];

const to        = path.resolve(__dirname, process.argv[4]);

const toKey     = process.argv[5];

let tmp         = require(from);

const value     = get(tmp, fromKey);

if ( ! value ) {

    throw `can't extract value from '${from}' under key: '${fromKey}'`;
}

tmp         = require(to);

set(tmp, toKey, value);

fs.writeFileSync(to, JSON.stringify(tmp, null, 4));


