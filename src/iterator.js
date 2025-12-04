// src/iterator.js
'use strict';
const fs = require('fs');
const { createTokenizer } = require('./tokenizer');

async function* iterateSqlStatements(path) {
  const stream = fs.createReadStream(path, { encoding: 'utf8' });
  const tokenizer = createTokenizer();

  let stmtTokens = [];
  const stmtQueue = [];

  function pushToken(tok) {
    stmtTokens.push(tok);
    if (tok.type === 'symbol' && tok.value === ';') {
      const completed = stmtTokens;
      stmtTokens = [];
      stmtQueue.push(completed);
    }
  }

  for await (const chunk of stream) {
    const toks = tokenizer.write(chunk);
    for (const t of toks) pushToken(t);
    while (stmtQueue.length) yield stmtQueue.shift();
  }

  const rest = tokenizer.end();
  for (const t of rest) pushToken(t);
  while (stmtQueue.length) yield stmtQueue.shift();

  if (stmtTokens.length) yield stmtTokens;
}

module.exports = { iterateSqlStatements };
