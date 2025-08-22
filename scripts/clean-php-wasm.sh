#!/bin/bash
set -e

SHARED_DIR="node_modules/@php-wasm/web/shared"

# 只保留 icudt74l.dat，删除 shared 目录下其它 .dat 文件
if [ -d "$SHARED_DIR" ]; then
  find "$SHARED_DIR" -type f -name "*.dat" ! -name "icudt74l.dat" -delete
fi

echo "Cleaned up @php-wasm/web: only icudt74l.dat 被保留"
