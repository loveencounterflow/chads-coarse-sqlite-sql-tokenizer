PRAGMA foreign_keys=OFF;
BEGIN TRANSACTION;
CREATE TABLE t ( d text );
INSERT INTO t VALUES('first');
INSERT INTO t VALUES('second');
CREATE TABLE t2 ( i integer );
CREATE TABLE User
        -- A table comment
(
        uid INTEGER,    -- A field comment
        flags INTEGER   -- Another field comment
);
COMMIT;
