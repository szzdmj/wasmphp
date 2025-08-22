#!/bin/bash
set -e

PHP_WASM_DIR="node_modules/@php-wasm/web/php"
SHARED_DIR="node_modules/@php-wasm/web/shared"

# 只清理多余的 .wasm 文件，保留所有 js 文件和目录结构
if [ -d "$PHP_WASM_DIR/asyncify" ]; then
  find "$PHP_WASM_DIR/asyncify" -type f -name "*.wasm" ! -name "php_8_4.wasm" -delete
fi

# 不再删除 jspi 目录和 js 文件，只清理其 wasm 文件
if [ -d "$PHP_WASM_DIR/jspi" ]; then
  find "$PHP_WASM_DIR/jspi" -type f -name "*.wasm" ! -name "php_8_4.wasm" -delete
fi

# 只保留 icudt74l.dat，删除 shared 目录下其它 .dat 文件
if [ -d "$SHARED_DIR" ]; then
  find "$SHARED_DIR" -type f -name "*.dat" ! -name "icudt74l.dat" -delete
fi

echo "Cleaned up @php-wasm/web: only 8.4 wasm、所有 js 文件和 icudt74l.dat 被保留"
