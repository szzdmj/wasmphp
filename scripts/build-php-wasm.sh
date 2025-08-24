#!/usr/bin/env bash
set -euo pipefail

ROOT="$(pwd)"
OUT_DIR="${ROOT}/scripts"
PHP_DIR="${ROOT}/vendor/php-src"

mkdir -p "${OUT_DIR}" "${ROOT}/vendor"

# 可用环境变量覆盖，默认 8.4 稳定标签
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

# 单线程 + Worker 环境 + 模块化 + 内存增长；禁用 JIT 宏（双保险）
CFLAGS_IN="${EMCC_CFLAGS:- -O3} -DPCRE2_CODE_UNIT_WIDTH=8 -DPCRE2_DISABLE_JIT -DSUPPORT_JIT=0 -DHAVE_PCRE_JIT=0"
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

# 兜底：若 Makefile 仍然引用 PCRE2 JIT/SLJIT 源，直接剔除（避免编译）
echo "[*] Checking Makefile(s) for unintended PCRE2 JIT objects..."
NEED_STRIP=0
for f in Makefile Makefile.objects ext/pcre/Makefile; do
  if [ -f "$f" ] && grep -qE 'pcre2_jit_(compile|match)\.|sljit/' "$f"; then
    echo "  - JIT refs found in $f"
    NEED_STRIP=1
  fi
done

if [ "$NEED_STRIP" = "1" ]; then
  echo "[*] Stripping JIT/SLJIT objects from Makefiles..."
  for f in Makefile Makefile.objects ext/pcre/Makefile; do
    [ -f "$f" ] || continue
    sed -i -E '/pcre2_jit_(compile|match)\.(lo|o)/d' "$f" || true
    sed -i -E '/sljit\//d' "$f" || true
  done
  echo "[*] After strip, verifying..."
  for f in Makefile Makefile.objects ext/pcre/Makefile; do
    [ -f "$f" ] || continue
    if grep -qE 'pcre2_jit_(compile|match)\.|sljit/' "$f"; then
      echo "[-] Still found JIT refs in $f"
      exit 1
    fi
  done
fi

# 降低并行度，便于阅读日志（需要可以上调 JOBS）
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
