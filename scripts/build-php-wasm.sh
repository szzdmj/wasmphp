#!/usr/bin/env bash
set -euo pipefail

ROOT="$(pwd)"
OUT_DIR="${ROOT}/scripts"
PHP_DIR="${ROOT}/vendor/php-src"

mkdir -p "${OUT_DIR}" "${ROOT}/vendor"

# 可通过环境变量 PHP_REF 覆盖，默认用 PHP 8.4 稳定标签
PHP_REF="${PHP_REF:-php-8.4.0}"

if [ ! -d "${PHP_DIR}" ]; then
  echo "[*] Cloning PHP src (${PHP_REF})..."
  git clone --depth=1 --branch "${PHP_REF}" https://github.com/php/php-src.git "${PHP_DIR}"
fi

cd "${PHP_DIR}"

echo "[*] Running buildconf..."
./buildconf --force

# 让 autoconf 明确识别为交叉编译（禁止运行测试程序）
HOST_TRIPLE="wasm32-unknown-emscripten"
BUILD_TRIPLE="$(/bin/sh build/config.guess || echo x86_64-pc-linux-gnu)"

# 组装编译/链接参数：单线程 + Worker 环境 + 模块化 ES6 输出 + 允许内存增长
CFLAGS_IN="${EMCC_CFLAGS:- -O3}"
LDFLAGS_IN="${EMCC_LDFLAGS:-} -s EXIT_RUNTIME=0 -s ERROR_ON_UNDEFINED_SYMBOLS=0"

echo "[*] emconfigure ./configure ..."
set +e
emconfigure ./configure \
  --host="${HOST_TRIPLE}" \
  --build="${BUILD_TRIPLE}" \
  --disable-all \
  --enable-cli \
  --disable-zts \
  --without-pear \
  CFLAGS="${CFLAGS_IN}" LDFLAGS="${LDFLAGS_IN}"
CFG_RC=$?
set -e

if [ $CFG_RC -ne 0 ]; then
  echo "[-] configure failed with code ${CFG_RC}. Dumping tail of config.log:"
  tail -n 200 config.log || true
  exit $CFG_RC
fi

echo "[*] emmake make ..."
# 如遇 OOM 或奇怪报错，可把并行数降到 2 或 1
emmake make -j"$(nproc)" || {
  echo "[-] Build failed. Try reducing parallelism or disabling more extensions."
  exit 1
}

echo "[*] Packaging to ${OUT_DIR}/php_8_4.js / .wasm ..."

# 优先采用 Emscripten 直接生成的 JS/WASM 包装（典型路径）
if [ -f "sapi/cli/php.js" ] && [ -f "sapi/cli/php.wasm" ]; then
  cp -f "sapi/cli/php.js"   "${OUT_DIR}/php_8_4.js"
  cp -f "sapi/cli/php.wasm" "${OUT_DIR}/php_8_4.wasm"
# 次选：如果产物是 .bc，则手动链接
elif ls sapi/cli/*.bc >/dev/null 2>&1; then
  BC_MAIN="$(ls sapi/cli/*.bc | head -n1)"
  echo "[*] Linking ${BC_MAIN} via emcc ..."
  emcc "${BC_MAIN}" -o "${OUT_DIR}/php_8_4.js" \
    ${CFLAGS_IN} ${LDFLAGS_IN} \
    -s INITIAL_MEMORY=268435456
  # emcc 会同时生成 .wasm 到同目录
else
  echo "[-] Could not find Emscripten outputs (sapi/cli/php.js or .bc)."
  echo "    Please check build logs and consider reducing extensions further."
  exit 1
fi

# 校验输出
if [ ! -f "${OUT_DIR}/php_8_4.js" ] || [ ! -f "${OUT_DIR}/php_8_4.wasm" ]; then
  echo "[-] Missing outputs. Listing sapi/cli and ${OUT_DIR}:"
  ls -lah sapi/cli/ || true
  ls -lah "${OUT_DIR}" || true
  exit 1
fi

ls -lh "${OUT_DIR}"/php_8_4.*
echo "[+] Build done."
