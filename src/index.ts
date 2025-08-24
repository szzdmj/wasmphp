import wasmBinary from "../scripts/php_8_4.wasm";
import { init } from "../scripts/php_8_4.js";

// 懒加载与缓存，避免每次请求重复初始化
let inited = false;
let initPromise: Promise<void> | null = null;

async function ensureReady() {
  if (inited) return;
  if (!initPromise) {
    initPromise = (async () => {
      // esbuild 的 --loader:.wasm=binary 会把 .wasm 打包为 Uint8Array
      const loader: any = { wasmBinary };
      await init("WORKER", loader);
      inited = true;
    })();
  }
  await initPromise;
}

export default {
  async fetch(request: Request, env: unknown, ctx: ExecutionContext): Promise<Response> {
    try {
      // 可选：预热而不阻塞首包
      // ctx.waitUntil(ensureReady());
      await ensureReady();
      return new Response("PHP WASM initialized!", { status: 200 });
    } catch (e: any) {
      console.error("Worker error:", e?.stack || e?.message || e);
      return new Response("Runtime error: " + (e?.message || e), { status: 500 });
    }
  }
};
