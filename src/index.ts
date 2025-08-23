import { dependencyFilename } from '../scripts/php_8_4.js';

export default {
  async fetch(request, env, ctx) {
    try {
      // 仅用最小 wasm importObject
      const { instance } = await WebAssembly.instantiate(dependencyFilename, {});
      // 可选：调用 instance.exports.main() 等
      return new Response("WASM instantiate OK!", { status: 200 });
    } catch (e) {
      return new Response("WASM instantiate error: " + e.toString(), { status: 500 });
    }
  }
}
