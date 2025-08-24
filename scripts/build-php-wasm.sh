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
    EXTRACT_DIR="${SRC_PARENT}/${PHP_REF}"
    if [ ! -d "${EXTRACT_DIR}" ]; then
      EXTRACT_DIR="$(ls -d ${SRC_PARENT}/php-*/ | head -n1)"
      EXTRACT_DIR="${EXTRACT_DIR%/}"
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

# Pre-patch 5: ensure ps_title.c has a harmless setproctitle stub for Emscripten
PS_TITLE_C="sapi/cli/ps_title.c"
if [ -f "${PS_TITLE_C}" ]; then
  if [ ! -f "${PS_TITLE_C}.upstream" ]; then
    mv "${PS_TITLE_C}" "${PS_TITLE_C}.upstream"
    echo "  - backing up ${PS_TITLE_C} -> ${PS_TITLE_C}.upstream"
  fi
  {
    cat <<'EOF'
/* WASM: provide a no-op setproctitle to satisfy PS_USE_SETPROCTITLE on Emscripten */
#if defined(__EMSCRIPTEN__) && !defined(HAVE_SETPROCTITLE)
__attribute__((unused))
static void setproctitle(const char *fmt, ...) { (void)fmt; }
#endif
EOF
    cat "${PS_TITLE_C}.upstream"
  } > "${PS_TITLE_C}"
  echo "  - injected setproctitle() stub into ${PS_TITLE_C}"
  STUB_COUNT=$((STUB_COUNT+1))
fi

echo "[*] Total stubbed files: ${STUB_COUNT}"

# Cross triples
HOST_TRIPLE="wasm32-unknown-emscripten"
BUILD_TRIPLE="$(/bin/sh build/config.guess || echo x86_64-pc-linux-gnu)"

# Build flags
COMMON_EM_FLAGS='-s EXIT_RUNTIME=0 -s ERROR_ON_UNDEFINED_SYMBOLS=0 -s WASM=1 -s MODULARIZE=1 -s EXPORT_ES6=1 -s ENVIRONMENT=worker -s ALLOW_MEMORY_GROWTH=1 -s FILESYSTEM=1'

# Use absolute path for the forced-include header so it works in all subdirs
SYSLOG_COMPAT_ABS="${PWD}/main/php_wasm_syslog_compat.h"

# Conservative CPP flags
CPPFLAGS_IN="${EMCC_CPPFLAGS:-} -DPCRE2_CODE_UNIT_WIDTH=8 -DPCRE2_DISABLE_JIT -DSUPPORT_JIT=0 -DHAVE_PCRE_JIT=0 -DSLJIT_CONFIG_UNSUPPORTED=1 -include ${SYSLOG_COMPAT_ABS}"
CFLAGS_IN="${EMCC_CFLAGS:- -O3}"
LDFLAGS_IN="${EMCC_LDFLAGS:-} ${COMMON_EM_FLAGS}"

# Hint autoconf to avoid selecting syslog, dns, and setproctitle paths (double insurance)
export ac_cv_func_dns_search=no
export ac_cv_func_dns_open=no
export ac_cv_func_dns_free=no
export ac_cv_func_res_nsearch=no
export ac_cv_func_res_ndestroy=no
export ac_cv_header_syslog_h=no
export ac_cv_func_syslog=no
export ac_cv_func_vsyslog=no
export ac_cv_func_setproctitle=no

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
  {
    grep -nE "(/emscripten/em(cc|\+\+)| error: |: error:|No such file or directory|command not found|bison|re2c|php_wasm_syslog_compat.h|setproctitle|ps_title\\.c)" "${OUT_DIR}/build.log" | tail -n 200;
    echo "---- tail of build.log (last 400 lines) ----";
    tail -n 400 "${OUT_DIR}/build.log";
  } || true
  exit ${EC}
fi

# Try to ensure CLI target gets linked even in cross builds
if [ ! -f "sapi/cli/php.js" ] && [ ! -f "sapi/cli/php.wasm" ] && ! ls sapi/cli/*.bc >/dev/null 2>&1; then
  echo "[*] CLI outputs missing after top-level make; trying to build sapi/cli/php explicitly ..."
  set -o pipefail
  emmake make -C sapi/cli V=1 php 2>&1 | tee -a "${OUT_DIR}/build.log"
  EC2=${PIPESTATUS[0]}
  set +o pipefail
  if [ ${EC2} -ne 0 ]; then
    echo "[-] Explicit build of sapi/cli/php failed with code ${EC2}"
  fi
fi

echo "[*] Packaging outputs ..."
FOUND=0

pick_js_wasm_pair() {
  local js="$1"
  local wasm="$2"
  if [ -f "$js" ] && [ -f "$wasm" ]; then
    echo "[*] Found pair: $js and $wasm"
    cp -f "$js"   "${OUT_DIR}/php_8_4.js"
    cp -f "$wasm" "${OUT_DIR}/php_8_4.wasm"
    return 0
  fi
  return 1
}

is_emscripten_js() {
  local f="$1"
  # Heuristics: Emscripten outputs contain "Module" and/or "Generated by Emscripten"
  grep -qE "Generated by Emscripten|var Module|Module\\s*=\\s*Module" "$f" 2>/dev/null
}

# Case 1: direct emscripten outputs adjacent to target name
if [ ${FOUND} -eq 0 ]; then
  if pick_js_wasm_pair "sapi/cli/php.js" "sapi/cli/php.wasm"; then FOUND=1; fi
fi

# Case 2: libtool subdir
if [ ${FOUND} -eq 0 ]; then
  if pick_js_wasm_pair "sapi/cli/.libs/php.js" "sapi/cli/.libs/php.wasm"; then FOUND=1; fi
fi

# Case 3: no-ext php but is a JS glue file + side wasm
if [ ${FOUND} -eq 0 ] && [ -f "sapi/cli/php" ] && [ -f "sapi/cli/php.wasm" ]; then
  if is_emscripten_js "sapi/cli/php"; then
    echo "[*] Detected Emscripten JS at sapi/cli/php with side wasm"
    cp -f "sapi/cli/php"     "${OUT_DIR}/php_8_4.js"
    cp -f "sapi/cli/php.wasm" "${OUT_DIR}/php_8_4.wasm"
    FOUND=1
  fi
fi

# Case 4: a.out outputs
if [ ${FOUND} -eq 0 ]; then
  if pick_js_wasm_pair "sapi/cli/a.out.js" "sapi/cli/a.out.wasm"; then FOUND=1; fi
fi
if [ ${FOUND} -eq 0 ]; then
  if pick_js_wasm_pair "a.out.js" "a.out.wasm"; then FOUND=1; fi
fi

# Case 5: bc fallback linking
if [ ${FOUND} -eq 0 ] && ls sapi/cli/*.bc >/dev/null 2>&1; then
  BC_MAIN="$(ls -S sapi/cli/*.bc | head -n1)"
  echo "[*] Linking ${BC_MAIN} via emcc ..."
  emcc "${BC_MAIN}" -o "${OUT_DIR}/php_8_4.js" \
    ${CPPFLAGS_IN} ${CFLAGS_IN} ${LDFLAGS_IN} \
    -s INITIAL_MEMORY=268435456
  FOUND=1
fi

# Case 6: generic search in sapi/cli and .libs for largest wasm + matched js
if [ ${FOUND} -eq 0 ]; then
  CAND_WASM="$(find sapi/cli -maxdepth 2 -type f -name '*.wasm' -printf '%s %p\n' 2>/dev/null | sort -nr | awk 'NR==1{print $2}')"
  if [ -n "${CAND_WASM:-}" ]; then
    CAND_JS="${CAND_WASM%.wasm}.js"
    if [ -f "${CAND_JS}" ]; then
      echo "[*] Using largest wasm candidate: ${CAND_WASM}"
      cp -f "${CAND_JS}"   "${OUT_DIR}/php_8_4.js"
      cp -f "${CAND_WASM}" "${OUT_DIR}/php_8_4.wasm"
      FOUND=1
    fi
  fi
fi

if [ ${FOUND} -eq 0 ]; then
  echo "[-] Could not find Emscripten outputs (php.js/php.wasm or equivalents). Build tree snapshot:"
  echo "---- Makefile CLI hints ----"
  { grep -nE 'SAPI|CLI|php_cli|sapi/cli' Makefile || true; } | head -n 300
  echo "---- sapi/cli listing ----"
  ls -lah sapi/cli/ || true
  echo "---- find sapi/cli (files) ----"
  find sapi/cli -maxdepth 3 -type f -ls || true
  echo "---- tail of build.log (last 400 lines) ----"
  tail -n 400 "${OUT_DIR}/build.log" || true
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
