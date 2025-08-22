#!/bin/bash
set -e

PHP_WASM_DIR="node_modules/@php-wasm/web/php"
SHARED_DIR="node_modules/@php-wasm/web/shared"

# 若目录不存在则跳过
if [ ! -d "$PHP_WASM_DIR/asyncify" ]; then
  echo "WARNING: $PHP_WASM_DIR/asyncify does not exist, skipping clean."
  exit 0
fi

# 1. 只保留 asyncify/8_4_10
find "$PHP_WASM_DIR/asyncify" -mindepth 1 -maxdepth 1 ! -name "8_4_10" -exec rm -rf {} +
rm -rf "$PHP_WASM_DIR/jspi"

# 2. 清理 shared 目录，只保留 icudt74l.dat
if [ -d "$SHARED_DIR" ]; then
  find "$SHARED_DIR" -type f ! -name "icudt74l.dat" -delete
fi

echo "Cleaned up @php-wasm/web, kept only PHP 8.4 and icudt74l.dat"
