#!/usr/bin/env bash
set -euo pipefail
SQLITE_REPO=${SQLITE_REPO:-https://github.com/sqlite/sqlite.git}

TARGET_DIR="./fuzz/sqlite-corpus"

mkdir -p "$TARGET_DIR"
TMP_DIR=$(mktemp -d)
git clone --depth 1 "$SQLITE_REPO" "$TMP_DIR"
find "$TMP_DIR/test" "$TMP_DIR/ext/misc" -type f \( -name ".sql" -o -name ".test" \) -exec cp {} "$TARGET_DIR/" \;
rm -rf "$TMP_DIR"
echo "SQLite fuzz corpus copied to $TARGET_DIR"

