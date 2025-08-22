#!/bin/bash
# 一键清理 node_modules/@php-wasm/web 只保留 PHP 8.4 及必要资源

set -e

PHP_WASM_DIR="node_modules/@php-wasm/web/php"
SHARED_DIR="node_modules/@php-wasm/web/shared"

# 1. 只保留 asyncify/8_4_10
find "$PHP_WASM_DIR/asyncify" -mindepth 1 -maxdepth 1 ! -name "8_4_10" -exec rm -rf {} +
# 可选：如果你不需要 jspi，可以直接删掉整个 jspi 目录
rm -rf "$PHP_WASM_DIR/jspi"

# 2. 清理 shared 目录，只保留 icudt74l.dat
find "$SHARED_DIR" -type f ! -name "icudt74l.dat" -delete

echo "清理完成，只保留了 PHP 8.4 (asyncify) 和 icudt74l.dat"
