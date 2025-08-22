import { build } from 'esbuild';
import ignore from 'esbuild-plugin-ignore';

build({
  entryPoints: ['src/index.ts'],
  bundle: true,
  outfile: 'dist/worker.js',
  platform: 'browser',
  target: 'esnext',
  loader: { '.dat': 'file', '.wasm': 'file' },
  plugins: [ignore(['node:events', 'node:perf_hooks', 'node:stream', 'node:tty'])],
});
