#!/bin/bash
set -e

# 1. 清理 node_modules/@php-wasm/web 下的无用文件夹，避免包体积过大
if [ -d node_modules/@php-wasm/web ]; then
  rm -rf node_modules/@php-wasm/web/php
  mkdir -p node_modules/@php-wasm/web/php/asyncify/8_4_10
fi

# 2. 复制你编译好的核心文件到 deep import 需要的位置
cp scripts/php_8_4.js node_modules/@php-wasm/web/php/asyncify/8_4_10/php_8_4.js
cp scripts/php_8_4.wasm node_modules/@php-wasm/web/php/asyncify/8_4_10/php_8_4.wasm

echo "已将 scripts/php_8_4.js 和 scripts/php_8_4.wasm 复制到 node_modules/@php-wasm/web/php/asyncify/8_4_10/"
