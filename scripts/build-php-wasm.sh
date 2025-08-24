#!/usr/bin/env bash
set -euo pipefail

# Directories
ROOT="$(pwd)"
OUT_DIR="${ROOT}/scripts"
PHP_DIR="${ROOT}/vendor/php-src"

mkdir -p "${OUT_DIR}" "${ROOT}/vendor"

# PHP ref can be overridden: PHP_REF=php-8.4.0 or master
PHP_REF="${PHP_REF:-php-8.4.0}"

if [ ! -d "${PHP_DIR}" ]; then
  echo "[*] Cloning PHP src (${PHP_REF})..."
  git clone --depth=1 --branch "${PHP_REF}" https://github.com/php/php-src.git "${PHP_DIR}"
fi

cd "${PHP_DIR}"

echo "[*] Running buildconf..."
./buildconf --force

# Pre-patch: hard-disable PCRE2 JIT by stubbing all JIT and sljit sources.
echo "[*] Stubbing PCRE2 JIT sources for WASM (pcre2_jit_*.c and sljit/*.c)..."
STUB_COUNT=0
# 1) Stub any pcre2_jit_*.c files
while IFS= read -r -d '' f; do
  if [ ! -f "${f}.upstream" ]; then mv "$f" "${f}.upstream"; fi
  cat > "$f" <<'EOF'
/* WASM build: PCRE2 JIT disabled, empty translation unit */
#define PCRE2_CODE_UNIT_WIDTH 8
void __pcre2_wasm_nojit_stub(void) {}
EOF
  echo "  - stubbed: $f"
  STUB_COUNT=$((STUB_COUNT+1))
done < <(find ext -type f -name 'pcre2_jit_*.c' -print0 2>/dev/null)

# 2) Stub any sljit/*.c files to avoid arch-specific JIT code
while IFS= read -r -d '' f; do
  if [ ! -f "${f}.upstream" ]; then mv "$f" "${f}.upstream"; fi
  cat > "$f" <<'EOF'
/* WASM build: SLJIT disabled for PCRE2 JIT, empty translation unit */
void __sljit_wasm_nojit_stub(void) {}
EOF
  echo "  - stubbed: $f"
  STUB_COUNT=$((STUB_COUNT+1))
done < <(find ext -type f -path '*/sljit/*.c' -print0 2>/dev/null)

echo "[*] Total stubbed files: ${STUB_COUNT}"

# Cross triples
HOST_TRIPLE="wasm32-unknown-emscripten"
BUILD_TRIPLE="$(/bin/sh build/config.guess || echo x86_64-pc-linux-gnu)"

# Build flags
# - Disable PCRE2 JIT in multiple ways (configure + macros)
# - Single-thread, ES6 module, Worker, allow memory growth, FS on
COMMON_EM_FLAGS='-s EXIT_RUNTIME=0 -s ERROR_ON_UNDEFINED_SYMBOLS=0 -s WASM=1 -s MODULARIZE=1 -s EXPORT_ES6=1 -s ENVIRONMENT=worker -s ALLOW_MEMORY_GROWTH=1 -s FILESYSTEM=1'
CPPFLAGS_IN="${EMCC_CPPFLAGS:-} -DPCRE2_CODE_UNIT_WIDTH=8 -DPCRE2_DISABLE_JIT -DSUPPORT_JIT=0 -DHAVE_PCRE_JIT=0 -DSLJIT_CONFIG_UNSUPPORTED=1"
CFLAGS_IN="${EMCC_CFLAGS:- -O3}"
LDFLAGS_IN="${EMCC_LDFLAGS:-} ${COMMON_EM_FLAGS}"

echo "[*] emconfigure ./configure ..."
set +e
emconfigure ./configure \
  --host="${HOST_TRIPLE}" \
  --build="${BUILD_TRIPLE}" \
  --disable-all \
  --enable-cli \
  --disable-zts \
  --disable-opcache \
  --without-pear \
  --with-pcre-jit=no \
  CPPFLAGS="${CPPFLAGS_IN}" CFLAGS="${CFLAGS_IN}" LDFLAGS="${LDFLAGS_IN}"
CFG_RC=$?
set -e

if [ $CFG_RC -ne 0 ]; then
  echo "[-] configure failed with code ${CFG_RC}. Tail of config.log:"
  tail -n 200 config.log || true
  exit $CFG_RC
fi

# Compile with low parallelism for clearer logs
JOBS="${JOBS:-1}"
echo "[*] emmake make -j${JOBS} V=1 ..."
emmake make -j"${JOBS}" V=1 || {
  echo "[-] Build failed. Showing last errors..."
  # Try to print last compiler error lines if available
  grep -RIn --color=never -E "error:|undefined reference|was not declared" . | tail -n 200 || true
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
    ${CPPFLAGS_IN} ${CFLAGS_IN} ${LDFLAGS_IN} \
    -s INITIAL_MEMORY=268435456
else
  echo "[-] Could not find Emscripten outputs (sapi/cli/php.js or .bc)."
  ls -lah sapi/cli/ || true
  exit 1
fi

# Verify outputs
if [ ! -f "${OUT_DIR}/php_8_4.js" ] || [ ! -f "${OUT_DIR}/php_8_4.wasm" ]; then
  echo "[-] Missing outputs. Listing sapi/cli and ${OUT_DIR}:"
  ls -lah sapi/cli/ || true
  ls -lah "${OUT_DIR}" || true
  exit 1
fi

ls -lh "${OUT_DIR}"/php_8_4.*
echo "[+] Build done."
