import { init, dependencyFilename } from '../scripts/php_8_4.js';

export default {
  async fetch(request, env, ctx) {
    const phpLoader = {};
    // dependencyFilename 是 Uint8Array
    phpLoader['wasmBinary'] = dependencyFilename;
    await init("WORKER", phpLoader);
    return new Response("WASM PHP initialized!", { status: 200 });
  }
}
