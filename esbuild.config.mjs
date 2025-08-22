import { build } from "esbuild";

build({
  entryPoints: ["src/index.ts"],
  bundle: true,
  outfile: "dist/worker.js",
  platform: "browser",
  target: "esnext",
  loader: { ".dat": "file", ".wasm": "file" },
  external: [
    "@php-wasm/web/php/asyncify/8_4_10/php_8_4.js",
    "@php-wasm/web/php/asyncify/8_4_10/php_8_4.wasm",
    "@php-wasm/web/shared/icudt74l.dat"
  ]
});
