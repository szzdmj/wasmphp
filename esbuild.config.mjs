import { build } from 'esbuild';

build({
  entryPoints: ['src/index.ts'],
  bundle: true,
  outfile: 'dist/worker.js',
  platform: 'browser',
  target: 'esnext',
  loader: { '.dat': 'file', '.wasm': 'file' },
  alias: {
    'node:events': './shims/empty.js',
    'node:perf_hooks': './shims/empty.js',
    'node:stream': './shims/empty.js',
    'node:tty': './shims/empty.js',
    events: './shims/empty.js',        // 有些包可能直接 import 'events'
    perf_hooks: './shims/empty.js',
    stream: './shims/empty.js',
    tty: './shims/empty.js',
  },
});
