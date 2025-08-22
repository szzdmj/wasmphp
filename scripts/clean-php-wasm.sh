#!/bin/bash
set -e

PHP_WASM_WEB_DIR="node_modules/@php-wasm/web"
KEEP_JS="$PHP_WASM_WEB_DIR/php/asyncify/8_4_10/php_8_4.js"
KEEP_WASM="$PHP_WASM_WEB_DIR/php/asyncify/8_4_10/php_8_4.wasm"
KEEP_DAT="$PHP_WASM_WEB_DIR/shared/icudt74l.dat"

# 1. 删除 php/asyncify 除 8_4_10 外所有目录
find "$PHP_WASM_WEB_DIR/php/asyncify" -mindepth 1 -maxdepth 1 ! -name "8_4_10" -exec rm -rf {} +
# 2. 删除 php/jspi 整个目录
rm -rf "$PHP_WASM_WEB_DIR/php/jspi"
# 3. 删除 asyncify/8_4_10 下除 php_8_4.js/php_8_4.wasm 外的所有文件
find "$PHP_WASM_WEB_DIR/php/asyncify/8_4_10" -type f ! -name "php_8_4.js" ! -name "php_8_4.wasm" -delete
# 4. shared 目录只保留 icudt74l.dat
find "$PHP_WASM_WEB_DIR/shared" -type f ! -name "icudt74l.dat" -delete

echo "Cleaned up @php-wasm/web: 只保留 asyncify/8_4_10/php_8_4.js, php_8_4.wasm, shared/icudt74l.dat"
