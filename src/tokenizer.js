// src/tokenizer.js
'use strict';

// Lossless incremental SQLite-aware tokenizer.
// Each token is { type, value, raw } where:
//  - type: 'identifier'|'string'|'symbol'|'number'|'whitespace'|'comment'|'blob'
//  - value: a convenient canonicalized text for the token (same as raw in this scaffold)
//  - raw: the exact substring from the original input (used for lossless reassembly)

function createTokenizer() {
  const state = {
    inString: false,
    stringChar: null,
    inBlockComment: false,
    buffer: '' // stores prefix content when token spans chunks
  };

  function emitToken(type, raw) {
    return { type, value: raw, raw };
  }

  function isIdentStart(ch) { return /[A-Za-z_]/.test(ch); }
  function isIdentPart(ch) { return /[A-Za-z0-9_]/.test(ch); }
  function isDigit(ch) { return /[0-9]/.test(ch); }

  function write(chunk) {
    const tokens = [];
    let i = 0;
    const len = chunk.length;

    while (i < len) {
      if (state.inString) {
        const q = state.stringChar;
        const start = i;
        while (i < len) {
          const c = chunk[i];
          if (c === q) {
            if (chunk[i+1] === q) { i += 2; continue; }
            i++;
            state.inString = false;
            state.stringChar = null;
            const raw = state.buffer + chunk.slice(start, i);
            state.buffer = '';
            tokens.push(emitToken('string', raw));
            break;
          }
          i++;
        }
        if (state.inString && start < len) {
          state.buffer += chunk.slice(start, len);
          i = len;
        }
        continue;
      }

      if (state.inBlockComment) {
        const start = i;
        while (i < len && !(chunk[i] === '*' && chunk[i+1] === '/')) i++;
        if (i < len) {
          i += 2;
          const raw = state.buffer + chunk.slice(start, i);
          state.buffer = '';
          state.inBlockComment = false;
          tokens.push(emitToken('comment', raw));
        } else {
          state.buffer += chunk.slice(start, len);
          i = len;
        }
        continue;
      }

      const c = chunk[i];
      const next = chunk[i+1];

      if (/\\s/.test(c)) {
        let start = i;
        while (i < len && /\\s/.test(chunk[i])) i++;
        tokens.push(emitToken('whitespace', chunk.slice(start, i)));
        continue;
      }

      if (c === '-' && next === '-') {
        let start = i;
        i += 2;
        while (i < len && chunk[i] !== '\\n') i++;
        tokens.push(emitToken('comment', chunk.slice(start, i)));
        continue;
      }

      if (c === '/' && next === '*') {
        let start = i;
        i += 2;
        let found = false;
        while (i < len) {
          if (chunk[i] === '*' && chunk[i+1] === '/') { i += 2; found = true; break; }
          i++;
        }
        if (found) {
          tokens.push(emitToken('comment', chunk.slice(start, i)));
        } else {
          state.inBlockComment = true;
          state.buffer = chunk.slice(start, len);
          i = len;
        }
        continue;
      }

      if (c === "'" || c === '"') {
        const q = c;
        let start = i;
        i++;
        let closed = false;
        while (i < len) {
          if (chunk[i] === q) {
            if (chunk[i+1] === q) { i += 2; continue; }
            i++;
            closed = true;
            break;
          }
          i++;
        }
        if (closed) {
          tokens.push(emitToken('string', chunk.slice(start, i)));
        } else {
          state.inString = true;
          state.stringChar = q;
          state.buffer = chunk.slice(start, len);
          i = len;
        }
        continue;
      }

      if ((c === 'X' || c === 'x') && next === "'") {
        let start = i;
        i += 2;
        while (i < len) {
          if (chunk[i] === "'") { i++; break; }
          i++;
        }
        tokens.push(emitToken('blob', chunk.slice(start, i)));
        continue;
      }

      if (isDigit(c)) {
        const start = i;
        while (i < len && /[0-9.eE+-]/.test(chunk[i])) i++;
        tokens.push(emitToken('number', chunk.slice(start, i)));
        continue;
      }

      if (isIdentStart(c)) {
        const start = i;
        while (i < len && isIdentPart(chunk[i])) i++;
        tokens.push(emitToken('identifier', chunk.slice(start, i)));
        continue;
      }

      tokens.push(emitToken('symbol', c));
      i++;
    }

    return tokens;
  }

  function end() {
    const tokens = [];
    if (state.inBlockComment) {
      tokens.push(emitToken('comment', state.buffer));
      state.inBlockComment = false;
      state.buffer = '';
    }
    if (state.inString) {
      tokens.push(emitToken('string', state.buffer));
      state.inString = false;
      state.stringChar = null;
      state.buffer = '';
    }
    return tokens;
  }

  return { write, end };
}

module.exports = { createTokenizer };
