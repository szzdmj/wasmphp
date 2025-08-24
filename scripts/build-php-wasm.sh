#!/usr/bin/env bash
set -euo pipefail

ROOT="$(pwd)"
OUT_DIR="${ROOT}/scripts"
PHP_DIR="${ROOT}/vendor/php-src"

mkdir -p "${OUT_DIR}" "${ROOT}/vendor"

# 覆盖可用：PHP_REF=php-8.4.0 / master
PHP_REF="${PHP_REF:-php-8.4.0}"

if [ ! -d "${PHP_DIR}" ]; then
  echo "[*] Cloning PHP src (${PHP_REF})..."
  git clone --depth=1 --branch "${PHP_REF}" https://github.com/php/php-src.git "${PHP_DIR}"
fi

cd "${PHP_DIR}"

echo "[*] Running buildconf..."
./buildconf --force

HOST_TRIPLE="wasm32-unknown-emscripten"
BUILD_TRIPLE="$(/bin/sh build/config.guess || echo x86_64-pc-linux-gnu)"

# 单线程 + Worker 环境 + 模块化 + 内存增长
# 关闭 PCRE2 JIT 的双保险：
# - PCRE2_DISABLE_JIT / SUPPORT_JIT=0 / HAVE_PCRE_JIT=0
# - SLJIT_CONFIG_UNSUPPORTED=1 防止 sljit 头文件触发 #error
CFLAGS_IN="${EMCC_CFLAGS:- -O3} -DPCRE2_CODE_UNIT_WIDTH=8 -DPCRE2_DISABLE_JIT -DSUPPORT_JIT=0 -DHAVE_PCRE_JIT=0 -DSLJIT_CONFIG_UNSUPPORTED=1"
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
  --with-pcre-jit=no \
  CFLAGS="${CFLAGS_IN}" LDFLAGS="${LDFLAGS_IN}"
CFG_RC=$?
set -e

if [ $CFG_RC -ne 0 ]; then
  echo "[-] configure failed with code ${CFG_RC}. Tail of config.log:"
  tail -n 200 config.log || true
  exit $CFG_RC
fi

# 尝试从 Makefile 中去除 JIT/SLJIT 目标（不同分支写法可能不同，做宽匹配）
echo "[*] Checking Makefile(s) for unintended PCRE2 JIT objects..."
FOUND=0
for f in Makefile Makefile.objects ext/pcre/Makefile; do
  [ -f "$f" ] || continue
  if grep -qE '(pcre2_jit_(compile|match)\.(lo|o)|[[:space:]]sljit/|/sljit[^[:alnum:]_])' "$f"; then
    echo "  - JIT refs found in $f"
    FOUND=1
    # 粗暴删除包含这些词的整行
    sed -i -E '/pcre2_jit_(compile|match)\.(lo|o)/d' "$f" || true
    sed -i -E '/(^|[[:space:]])sljit\//d' "$f" || true
    sed -i -E '/\/sljit([^[:alnum:]_]|$)/d' "$f" || true
  fi
done

if [ "$FOUND" = "1" ]; then
  echo "[*] After strip, re-check:"
  STILL=0
  for f in Makefile Makefile.objects ext/pcre/Makefile; do
    [ -f "$f" ] || continue
    if grep -qE '(pcre2_jit_(compile|match)\.(lo|o)|[[:space:]]sljit/|/sljit[^[:alnum:]_])' "$f"; then
      echo "  ! Still found JIT refs in $f (will rely on compile-time macros to bypass)"
      STILL=1
    fi
  done
  if [ "$STILL" = "1" ]; then
    echo "[!] Warning: JIT object refs remain in Makefile(s), but SLJIT_CONFIG_UNSUPPORTED=1 and PCRE2_DISABLE_JIT will prevent arch-specific JIT code."
  fi
fi

# 降并发，日志更清楚；需要可以 JOBS=2
JOBS="${JOBS:-1}"
echo "[*] emmake make -j${JOBS} V=1 ..."
emmake make -j"${JOBS}" V=1 || {
  echo "[-] Build failed. Try JOBS=1 and ensure JIT is disabled."
  exit 1
}

echo "[*] Packaging to ${OUT_DIR}/php_8_4.js / .wasm ..."
if [ -f "sapi/cli/php.js" ] && [ -f "sapi/cli/php.wasm" ]; then
  cp -f "sapi/cli/php.js"   "${OUT_DIR}/php_8_4.js"
  cp -f "sapi/cli/php.wasm" "${OUT_DIR}/php_8_4.wasm"
elif ls sapi/cli/*.bc >/dev/null 2>&1; then
  BC_MAIN="$(ls sapi/cli/*.bc | head -n1)"
  echo "[*] Linking ${BC_MAIN} via emcc ..."
  emcc "${BC_MAIN}" -o "${OUT_DIR}/php_8_4.js" \
    ${CFLAGS_IN} ${LDFLAGS_IN} \
    -s INITIAL_MEMORY=268435456
else
  echo "[-] Could not find Emscripten outputs (sapi/cli/php.js or .bc)."
  ls -lah sapi/cli/ || true
  exit 1
fi

if [ ! -f "${OUT_DIR}/php_8_4.js" ] || [ ! -f "${OUT_DIR}/php_8_4.wasm" ]; then
  echo "[-] Missing outputs. Listing sapi/cli and ${OUT_DIR}:"
  ls -lah sapi/cli/ || true
  ls -lah "${OUT_DIR}" || true
  exit 1
fi

ls -lh "${OUT_DIR}"/php_8_4.*
echo "[+] Build done."
