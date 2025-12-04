
# chads-coarse-sqlite-sql-tokenizer

A **lossless, streaming, SQLite-aware SQL tokenizer and statement iterator**, generated collaboratively.

This repository is based on a long technical exchange with ChatGPT.  
Key design goals:

- **Lossless** tokenization (`raw` text preserved exactly).
- **Streaming** / chunked parsing suitable for SQLite dump files.
- **Async iterator** yielding completed SQL statements.
- **Fuzz-testable** with real SQLite test corpora.
- **Comment-preserving**, including multiline comment boundaries across chunks.

## Conversational Design History

This project specification was refined in our ChatGPT conversation on 2025‑12‑04.  
The tokenizer, iterator, fuzz harness, and repository scaffold were built from these messages.

(If you publish this repo publicly, you may wish to quote relevant excerpts in a `HISTORY.md`.)

## Installation

```
npm install
```

## Usage

```js
const { iterateSqlStatements } = require('chads-coarse-sqlite-sql-tokenizer');

for await (const tokens of iterateSqlStatements("dump.sql")) {
  const sql = tokens.map(t => t.raw).join('');
  console.log("Statement:", sql);
}
```

## Tests

```
npm test
```

## Fuzzing

```
SQLITE_REPO=/path/to/sqlite ./fuzz/run-fuzz-harness.sh
```

