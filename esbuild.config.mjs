import { build } from "esbuild";

build({
  entryPoints: ["src/index.ts"],
  bundle: true,
  outfile: "dist/worker.js",
  platform: "browser",
  target: "esnext",
  loader: { ".dat": "file", ".wasm": "file" },
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
