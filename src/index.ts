// Cloudflare Module Worker：使用 wasm_modules 绑定并覆盖 instantiateWasm。
// 这样无需依赖 import.meta.url 或 locateFile，即可稳定在 Worker 环境运行。

import createPHP from '../scripts/php_8_4.js';

export interface Env {
  PHP_WASM: WebAssembly.Module;
}

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url);

    // 简单路由：/ 和 /run 运行一段 PHP；/info 输出 phpinfo()
    // 你也可以根据需要扩展更多路由。
    if (url.pathname === '/' || url.pathname === '/run' || url.pathname === '/info') {
      let out = '';

      const php = await createPHP({
        // 关键：直接用绑定的 WebAssembly.Module 实例化，绕过 URL/路径问题
        instantiateWasm(imports: WebAssembly.Imports, onSuccess: (instance: WebAssembly.Instance, module: WebAssembly.Module) => void) {
          WebAssembly.instantiate(env.PHP_WASM, imports).then(({ instance, module }) => {
            onSuccess(instance, module);
          });
          // 按 Emscripten 约定返回空对象，表示采用异步实例化路径
          return {};
        },
        print: (txt: string) => { out += txt + '\n'; },
        printErr: (txt: string) => { out += '[stderr] ' + txt + '\n'; }
      });

      if (url.pathname === '/info') {
        // 输出精简的 phpinfo（注意：输出较大，按需使用）
        php.callMain(['-r', 'phpinfo();']);
      } else {
        php.callMain(['-r', 'echo "Hello from PHP WASM in Cloudflare Worker\n";']);
      }

      return new Response(out, {
        headers: { 'content-type': 'text/plain; charset=utf-8' }
      });
    }

    return new Response('Not Found', { status: 404 });
  }
};
