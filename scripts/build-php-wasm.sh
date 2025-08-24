#!/usr/bin/env bash
set -euo pipefail

# Directories
ROOT="$(pwd)"
OUT_DIR="${ROOT}/scripts"
SRC_PARENT="${ROOT}/vendor"
PHP_DIR="${SRC_PARENT}/php-src"

mkdir -p "${OUT_DIR}" "${SRC_PARENT}"

# PHP ref can be overridden: PHP_REF=php-8.4.0 or master
PHP_REF="${PHP_REF:-php-8.4.0}"

# Decide source: tarball for official releases (php-X.Y.Z), git otherwise
use_tarball=0
if [[ "${PHP_REF}" =~ ^php-[0-9]+\.[0-9]+\.[0-9]+$ ]]; then
  use_tarball=1
fi

if [ ! -d "${PHP_DIR}" ]; then
  if [ "${use_tarball}" -eq 1 ]; then
    echo "[*] Downloading PHP release tarball ${PHP_REF}..."
    TARBALL_URL="https://www.php.net/distributions/${PHP_REF}.tar.gz"
    TARBALL="${SRC_PARENT}/${PHP_REF}.tar.gz"
    curl -fsSL "${TARBALL_URL}" -o "${TARBALL}"
    echo "[*] Extracting tarball..."
    tar -xzf "${TARBALL}" -C "${SRC_PARENT}"
    # The tarball extracts to php-X.Y.Z, move/rename to php-src
    EXTRACT_DIR="${SRC_PARENT}/${PHP_REF/php-/php-}"
    if [ ! -d "${EXTRACT_DIR}" ]; then
      # Fallback: try without 'php-' prefix mismatch
      EXTRACT_DIR_GLOB="$(echo ${SRC_PARENT}/php-*/)"
      EXTRACT_DIR="${EXTRACT_DIR_GLOB%/}"
    fi
    mv "${EXTRACT_DIR}" "${PHP_DIR}"
  else
    echo "[*] Cloning PHP src (${PHP_REF})..."
    git clone --depth=1 --branch "${PHP_REF}" https://github.com/php/php-src.git "${PHP_DIR}"
  fi
fi

cd "${PHP_DIR}"

# Only needed for git checkouts; tarballs already have generated files
if [ "${use_tarball}" -eq 0 ]; then
  echo "[*] Running buildconf..."
  ./buildconf --force
fi

# Pre-patch 1: hard-disable PCRE2 JIT by stubbing all JIT and sljit sources.
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

# Pre-patch 2: stub ext/standard/dns.c to avoid dns_* API on Emscripten.
DNS_C="ext/standard/dns.c"
if [ -f "${DNS_C}" ]; then
  if [ ! -f "${DNS_C}.upstream" ]; then
    mv "${DNS_C}" "${DNS_C}.upstream"
    echo "  - backing up ${DNS_C} -> ${DNS_C}.upstream"
  fi
  cat > "${DNS_C}" <<'EOF'
/* WASM build: disable ext/standard DNS implementation (empty translation unit).
   Emscripten/musl lacks dns_* API used by php_dns macros. */
void __php_wasm_dns_stub(void) {}
EOF
  echo "  - stubbed: ${DNS_C}"
  STUB_COUNT=$((STUB_COUNT+1))
fi

# Pre-patch 3: stub main/php_syslog.c to avoid std_syslog/syslog on Emscripten.
SYSLOG_C="main/php_syslog.c"
if [ -f "${SYSLOG_C}" ]; then
  if [ ! -f "${SYSLOG_C}.upstream" ]; then
    mv "${SYSLOG_C}" "${SYSLOG_C}.upstream"
    echo "  - backing up ${SYSLOG_C} -> ${SYSLOG_C}.upstream"
  fi
  cat > "${SYSLOG_C}" <<'EOF'
/* WASM build: disable syslog usage (empty translation unit implementing php_syslog).
   Emscripten/musl lacks usable syslog in the target environment. */
#include "php.h"
#include "php_syslog.h"
#include <stdarg.h>
PHPAPI void php_syslog(int priority, const char *format, ...) {
  (void)priority; (void)format;
  va_list ap;
  va_start(ap, format);
  va_end(ap);
}
EOF
  echo "  - stubbed: ${SYSLOG_C}"
  STUB_COUNT=$((STUB_COUNT+1))
fi

# Pre-patch 4: add a compatibility header to provide LOG_* constants
COMPAT_HDR="main/php_wasm_syslog_compat.h"
cat > "${COMPAT_HDR}" <<'EOF'
#ifndef PHP_WASM_SYSLOG_COMPAT_H
#define PHP_WASM_SYSLOG_COMPAT_H
/* Minimal syslog constants for environments without <syslog.h> (e.g., Emscripten). */
/* Priorities */
#ifndef LOG_EMERG
# define LOG_EMERG   0
#endif
#ifndef LOG_ALERT
# define LOG_ALERT   1
#endif
#ifndef LOG_CRIT
# define LOG_CRIT    2
#endif
#ifndef LOG_ERR
# define LOG_ERR     3
#endif
#ifndef LOG_WARNING
# define LOG_WARNING 4
#endif
#ifndef LOG_NOTICE
# define LOG_NOTICE  5
#endif
#ifndef LOG_INFO
# define LOG_INFO    6
#endif
#ifndef LOG_DEBUG
# define LOG_DEBUG   7
#endif
/* Facilities (glibc-compatible values) */
#ifndef LOG_KERN
# define LOG_KERN    (0<<3)
#endif
#ifndef LOG_USER
# define LOG_USER    (1<<3)
#endif
#ifndef LOG_MAIL
# define LOG_MAIL    (2<<3)
#endif
#ifndef LOG_DAEMON
# define LOG_DAEMON  (3<<3)
#endif
#ifndef LOG_AUTH
# define LOG_AUTH    (4<<3)
#endif
#ifndef LOG_SYSLOG
# define LOG_SYSLOG  (5<<3)
#endif
#ifndef LOG_LPR
# define LOG_LPR     (6<<3)
#endif
#ifndef LOG_NEWS
# define LOG_NEWS    (7<<3)
#endif
#ifndef LOG_UUCP
# define LOG_UUCP    (8<<3)
#endif
#ifndef LOG_CRON
# define LOG_CRON    (9<<3)
#endif
#ifndef LOG_AUTHPRIV
# define LOG_AUTHPRIV (10<<3)
#endif
#ifndef LOG_FTP
# define LOG_FTP     (11<<3)
#endif
#ifndef LOG_LOCAL0
# define LOG_LOCAL0  (16<<3)
#endif
#ifndef LOG_LOCAL1
# define LOG_LOCAL1  (17<<3)
#endif
#ifndef LOG_LOCAL2
# define LOG_LOCAL2  (18<<3)
#endif
#ifndef LOG_LOCAL3
# define LOG_LOCAL3  (19<<3)
#endif
#ifndef LOG_LOCAL4
# define LOG_LOCAL4  (20<<3)
#endif
#ifndef LOG_LOCAL5
# define LOG_LOCAL5  (21<<3)
#endif
#ifndef LOG_LOCAL6
# define LOG_LOCAL6  (22<<3)
#endif
#ifndef LOG_LOCAL7
# define LOG_LOCAL7  (23<<3)
#endif
/* Options */
#ifndef LOG_PID
# define LOG_PID     0x01
#endif
#ifndef LOG_CONS
# define LOG_CONS    0x02
#endif
#ifndef LOG_ODELAY
# define LOG_ODELAY  0x04
#endif
#ifndef LOG_NDELAY
# define LOG_NDELAY  0x08
#endif
#ifndef LOG_NOWAIT
# define LOG_NOWAIT  0x10
#endif
#ifndef LOG_PERROR
# define LOG_PERROR  0x20
#endif
#endif /* PHP_WASM_SYSLOG_COMPAT_H */
EOF
echo "  - added ${COMPAT_HDR}"

echo "[*] Total stubbed files: ${STUB_COUNT}"

# Cross triples
HOST_TRIPLE="wasm32-unknown-emscripten"
BUILD_TRIPLE="$(/bin/sh build/config.guess || echo x86_64-pc-linux-gnu)"

# Build flags
COMMON_EM_FLAGS='-s EXIT_RUNTIME=0 -s ERROR_ON_UNDEFINED_SYMBOLS=0 -s WASM=1 -s MODULARIZE=1 -s EXPORT_ES6=1 -s ENVIRONMENT=worker -s ALLOW_MEMORY_GROWTH=1 -s FILESYSTEM=1'
# Force-include the syslog compat header so LOG_* constants always exist.
CPPFLAGS_IN="${EMCC_CPPFLAGS:-} -DPCRE2_CODE_UNIT_WIDTH=8 -DPCRE2_DISABLE_JIT -DSUPPORT_JIT=0 -DHAVE_PCRE_JIT=0 -DSLJIT_CONFIG_UNSUPPORTED=1 -include main/php_wasm_syslog_compat.h"
CFLAGS_IN="${EMCC_CFLAGS:- -O3}"
LDFLAGS_IN="${EMCC_LDFLAGS:-} ${COMMON_EM_FLAGS}"

# Hint autoconf to avoid selecting syslog and dns paths (double insurance)
export ac_cv_func_dns_search=no
export ac_cv_func_dns_open=no
export ac_cv_func_dns_free=no
export ac_cv_func_res_nsearch=no
export ac_cv_func_res_ndestroy=no
export ac_cv_header_syslog_h=no
export ac_cv_func_syslog=no
export ac_cv_func_vsyslog=no

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

# Compile with low parallelism for clearer logs and capture to build.log
JOBS="${JOBS:-1}"
echo "[*] emmake make -j${JOBS} V=1 (logging to ${OUT_DIR}/build.log) ..."
set -o pipefail
emmake make -j"${JOBS}" V=1 2>&1 | tee "${OUT_DIR}/build.log"
EC=${PIPESTATUS[0]}
set +o pipefail
if [ ${EC} -ne 0 ]; then
  echo "[-] Build failed. Showing relevant compiler errors from build.log:"
  # Try to surface the real cause: compiler errors or missing generators
  { 
    grep -nE "(/emscripten/em(cc|\+\+)| error: |: error:|No such file or directory|command not found|bison|re2c)" "${OUT_DIR}/build.log" | tail -n 200;
    echo "---- tail of build.log (last 400 lines) ----";
    tail -n 400 "${OUT_DIR}/build.log";
  } || true
  exit ${EC}
fi

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
  echo "[-] Could not find Emscripten outputs (sapi/cli/php.js or .bc). Listing sapi/cli:"
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
