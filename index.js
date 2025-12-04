// index.js
'use strict';
const { iterateSqlStatements } = require('./src/iterator');
const { createTokenizer } = require('./src/tokenizer');
module.exports = { iterateSqlStatements, createTokenizer };
