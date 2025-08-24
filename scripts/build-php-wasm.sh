#!/usr/bin/env bash
set -euo pipefail

ROOT="$(pwd)"
OUT_DIR="${ROOT}/scripts"
PHP_DIR="${ROOT}/vendor/php-src"

mkdir -p "${OUT_DIR}" "${ROOT}/vendor"

# 可用环境变量指定 PHP 版本/分支，默认用 8.4.0 稳定标签
PHP_REF="${PHP_REF:-php-8.4.0}"

if [ ! -d "${PHP_DIR}" ]; then
  echo "[*] Cloning PHP src (${PHP_REF})..."
  git clone --depth=1 --branch "${PHP_REF}" https://github.com/php/php-src.git "${PHP_DIR}"
fi

cd "${PHP_DIR}"

echo "[*] Running buildconf..."
./buildconf --force

# 让 autoconf 明确进入交叉编译模式
HOST_TRIPLE="wasm32-unknown-emscripten"
BUILD_TRIPLE="$(/bin/sh build/config.guess || echo x86_64-pc-linux-gnu)"

# 编译/链接参数：禁用线程 + Worker 环境 + 模块化 ES6 输出 + 允许内存增长 + 关闭未解析符报错
# 关键：禁用 PCRE2 JIT（WASM 不支持）
CFLAGS_IN="${EMCC_CFLAGS:- -O3} -DPCRE2_CODE_UNIT_WIDTH=8 -DPCRE2_DISABLE_JIT -DSUPPORT_JIT=0"
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
  --without-pcre-jit \
  CFLAGS="${CFLAGS_IN}" LDFLAGS="${LDFLAGS_IN}"
CFG_RC=$?
set -e

if [ $CFG_RC -ne 0 ]; then
  echo "[-] configure failed with code ${CFG_RC}. Dumping tail of config.log:"
  tail -n 200 config.log || true
  exit $CFG_RC
fi

# 降低并行度 + 打印编译命令，便于排查
JOBS="${JOBS:-2}"
echo "[*] emmake make -j${JOBS} V=1 ..."
emmake make -j"${JOBS}" V=1 || {
  echo "[-] Build failed. Try reducing parallelism (set JOBS=1) or further disabling features."
  exit 1
}

echo "[*] Packaging to ${OUT_DIR}/php_8_4.js / .wasm ..."

# 优先采用 Emscripten 直接生成的 JS/WASM
if [ -f "sapi/cli/php.js" ] && [ -f "sapi/cli/php.wasm" ]; then
  cp -f "sapi/cli/php.js"   "${OUT_DIR}/php_8_4.js"
  cp -f "sapi/cli/php.wasm" "${OUT_DIR}/php_8_4.wasm"
# 其次：若为 .bc 产物则手工链接
elif ls sapi/cli/*.bc >/dev/null 2>&1; then
  BC_MAIN="$(ls sapi/cli/*.bc | head -n1)"
  echo "[*] Linking ${BC_MAIN} via emcc ..."
  emcc "${BC_MAIN}" -o "${OUT_DIR}/php_8_4.js" \
    ${CFLAGS_IN} ${LDFLAGS_IN} \
    -s INITIAL_MEMORY=268435456
  # emcc 会同时生成 .wasm
else
  echo "[-] Could not find Emscripten outputs (sapi/cli/php.js or .bc)."
  ls -lah sapi/cli/ || true
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
