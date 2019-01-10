
const path      = require('path');

const fs        = require('fs');

const log       = require('inspc');

if (process.argv.length < 4) {

    throw `process.argv.length < 4`;
}

const from      = path.resolve(__dirname, process.argv[2]);

const to        = path.resolve(__dirname, process.argv[3]);

let tmp         = require(from);

const version   = tmp.version;

if ( ! version ) {

    throw `can't extract version from '${from}'`;
}

let tmp         = require(to);

tmp.version     = version;

fs.writeFileSync(to, JSON.stringify(tmp, null, 4));


