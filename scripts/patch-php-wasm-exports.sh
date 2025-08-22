#!/bin/bash
set -e

PKG=node_modules/@php-wasm/web/package.json
TMP=$(mktemp)

if [ -f "$PKG" ]; then
  node -e '
    const fs = require("fs");
    const file = process.argv[1];
    const pkg = JSON.parse(fs.readFileSync(file, "utf8"));
    pkg.exports = pkg.exports || {};
    pkg.exports["."] = { "import": "./index.js" };
    pkg.exports["./php/asyncify/8_4_10/php_8_4.js"] = { "import": "./php/asyncify/8_4_10/php_8_4.js" };
    fs.writeFileSync(file, JSON.stringify(pkg, null, 2));
  ' "$PKG"
  echo "已自动修正 @php-wasm/web/package.json 的 exports 字段"
else
  echo "$PKG 不存在，跳过 patch"
fi
