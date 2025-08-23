import { init } from '../scripts/php_8_4.js';

export default {
  async fetch(request, env, ctx) {
    const phpLoader = {};
    phpLoader['wasmBinary'] = env.PHP_WASM; // 重点：用 env 绑定
    await init("WORKER", phpLoader);
    return new Response("PHP WASM initialized!", { status: 200 });
  }
}
