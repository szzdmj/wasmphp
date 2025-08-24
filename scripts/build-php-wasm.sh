#!/usr/bin/env bash
set -euo pipefail

ROOT="$(pwd)"
OUT_DIR="${ROOT}/scripts"
PHP_DIR="${ROOT}/vendor/php-src"

mkdir -p "${OUT_DIR}" "${ROOT}/vendor"

if [ ! -d "${PHP_DIR}" ]; then
  echo "[*] Cloning PHP src..."
  git clone --depth=1 --branch master https://github.com/php/php-src.git "${PHP_DIR}"
fi

cd "${PHP_DIR}"

echo "[*] Running buildconf..."
./buildconf --force

echo "[*] emconfigure ./configure ..."
emconfigure ./configure \
  --disable-all \
  --enable-cli \
  --disable-zts \
  --without-pear \
  --with-libxml \
  --enable-json \
  --enable-filter \
  --enable-hash \
  --enable-session \
  --enable-tokenizer \
  --with-zlib \
  CFLAGS="${EMCC_CFLAGS:-}" LDFLAGS="${EMCC_LDFLAGS:-}"

echo "[*] emmake make ..."
emmake make -j"$(nproc)"

echo "[*] Packaging to ${OUT_DIR}/php_8_4.js / .wasm ..."
if ls sapi/cli/*.bc >/dev/null 2>&1; then
  BC_MAIN="$(ls sapi/cli/*.bc | head -n1)"
  emcc "${BC_MAIN}" -o "${OUT_DIR}/php_8_4.js" \
    -O3 ${EMCC_LDFLAGS:-} \
    -s INITIAL_MEMORY=268435456 \
    -s EXIT_RUNTIME=0
elif ls sapi/cli/*.js >/dev/null 2>&1; then
  cp -f sapi/cli/*.js "${OUT_DIR}/php_8_4.js"
  cp -f sapi/cli/*.wasm "${OUT_DIR}/php_8_4.wasm"
else
  echo "[-] Could not find Emscripten outputs (bc/js). Adjust paths or reduce extensions."
  exit 1
fi

ls -lh "${OUT_DIR}"/php_8_4.*
echo "[+] Build done."
