import { init } from '../scripts/php_8_4.js';

export default {
  async fetch(request: Request, env: any, ctx: ExecutionContext) {
    try {
      // Cloudflare wasm_modules 注入：env.PHP_WASM 通常是 WebAssembly.Module
      if (!env || !env.PHP_WASM) {
        console.error("env.PHP_WASM is missing");
        return new Response("WASM binding missing (env.PHP_WASM). Check wrangler.jsonc wasm_modules.", { status: 500 });
      }

      const phpLoader: any = {};
      phpLoader['wasmBinary'] = env.PHP_WASM;

      await init("WORKER", phpLoader);

      return new Response("PHP WASM initialized!", { status: 200 });
    } catch (e: any) {
      console.error("Worker error:", e?.stack || e?.message || e);
      return new Response("Runtime error: " + (e?.message || e), { status: 500 });
    }
  }
}
