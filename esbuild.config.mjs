import { build } from "esbuild";

build({
  entryPoints: ["src/index.ts"],
  bundle: true,
  outfile: "dist/worker.js",
  platform: "browser",
  target: "esnext",
  // 关键点：让 import "../scripts/php_8_4.wasm" 变成 Uint8Array（匹配 index.ts 中的 wasmBinary）
  loader: { ".dat": "file", ".wasm": "binary" },
  external: [
    "@php-wasm/web/php/asyncify/8_4_10/php_8_4.js",
    "@php-wasm/web/php/asyncify/8_4_10/php_8_4.wasm",
    "@php-wasm/web/shared/icudt74l.dat"
  ],
  plugins: [
    {
      name: "node-core-shim",
      setup(build) {
        for (const mod of ["node:events", "node:perf_hooks", "node:stream", "node:tty"]) {
          build.onResolve({ filter: new RegExp("^" + mod + "$") }, args => ({
            path: require.resolve("./shims/empty.js"),
          }));
        }
      }
    }
  ]
});
