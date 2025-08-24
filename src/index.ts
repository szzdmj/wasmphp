// Cloudflare Worker（Module Worker）示例：不使用 locateFile，不依赖 import.meta.url
// 直接通过 wasm_modules 绑定注入 wasm，并覆盖 Emscripten 的 instantiateWasm。

import createPHP from '../scripts/php_8_4.js';

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    // 若需要直接暴露 wasm（可选，便于调试）
    if (url.pathname === '/php_8_4.wasm') {
      return new Response(PHP_WASM, {
        headers: { 'content-type': 'application/wasm' },
      });
    }

    // 运行一个简单示例：/run
    if (url.pathname === '/' || url.pathname === '/run') {
      let out = '';
      const php = await createPHP({
        // 关键点：用绑定的 PHP_WASM（已是编译好的 WebAssembly.Module）
        instantiateWasm(imports, onSuccess) {
          WebAssembly.instantiate(PHP_WASM, imports).then((res) => {
            onSuccess(res.instance, res.module);
          });
          // Emscripten 要求返回值；返回空对象即可，表示异步路径
          return {};
        },
        print: (txt) => { out += txt + '\n'; },
        printErr: (txt) => { out += '[stderr] ' + txt + '\n'; },
      });

      // 直接执行一段 PHP 代码（Worker only 构建已启用 ENVIRONMENT=worker）
      php.callMain(['-r', 'echo "Hello from PHP WASM in Cloudflare Worker\n";']);

      return new Response(out, {
        headers: { 'content-type': 'text/plain; charset=utf-8' },
      });
    }

    return new Response('Not Found', { status: 404 });
  },
};
