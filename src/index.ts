// Cloudflare Module Worker: 直接 import WASM（ESM 风格），不使用 locateFile 或 wasm_modules。
// 通过覆盖 Emscripten 的 instantiateWasm 传入已导入的 WASM。

import createPHP from '../scripts/php_8_4.js';
// Wrangler/Cloudflare 对 ESM 的 .wasm import 会提供可直接用于 WebAssembly.instantiate 的对象
// 可能是 WebAssembly.Module 或者 ArrayBuffer，二者都可直接传给 instantiate。
/* eslint-disable @typescript-eslint/ban-ts-comment */
// @ts-expect-error - Wrangler 提供对 .wasm 的原生导入支持
import PHP_WASM from '../scripts/php_8_4.wasm';

export default {
  async fetch(request: Request): Promise<Response> {
    const url = new URL(request.url);

    let out = '';
    const php = await createPHP({
      instantiateWasm(imports: WebAssembly.Imports, onSuccess: (instance: WebAssembly.Instance, module: WebAssembly.Module) => void) {
        // 无论 PHP_WASM 是 Module 还是 ArrayBuffer，这里都可用同一调用
        WebAssembly.instantiate(PHP_WASM as any, imports).then(({ instance, module }) => {
          onSuccess(instance, module);
        });
        // 返回空对象表示走异步实例化路径（Emscripten 约定）
        return {};
      },
      print: (txt: string) => { out += txt + '\n'; },
      printErr: (txt: string) => { out += '[stderr] ' + txt + '\n'; }
    });

    // 简单路由
    if (url.pathname === '/info') {
      php.callMain(['-r', 'phpinfo();']);
    } else {
      // 支持 ?code= 传入一段 PHP 代码，默认打印一句话
      const code = url.searchParams.get('code') ?? 'echo "Hello from PHP WASM in Cloudflare Worker\\n";';
      php.callMain(['-r', code]);
    }

    return new Response(out, { headers: { 'content-type': 'text/plain; charset=utf-8' } });
  }
};
