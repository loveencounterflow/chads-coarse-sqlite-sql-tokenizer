// const { iterateSqlStatements } = require('chads-coarse-sqlite-sql-tokenizer');
const { iterateSqlStatements } = require( '.' );

// const path = '../jizura-sources-db/jzr.dump.sql';
const path = './test.dump.sql';

const demo = async function () {

  for await (const tokens of iterateSqlStatements( path ) ) {
    // console.log( 'Ωcst___1', 'tokens', tokens );
    const sql = tokens.map(t => t.raw).join('');
    console.log();
    console.log( '-- Ωcst___2 -------------------------------------------------------------------' );
    console.log( sql );
  }
}

demo()
