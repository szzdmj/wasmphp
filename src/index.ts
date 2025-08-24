// 保持“早上的结构”：使用 locateFile，但不再直接用 import.meta.url.href，避免在 CF Workers 模块环境下 undefined.href 报错。
// 添加两个最小路由：
// 1) /scripts/php_8_4.wasm 反代 GitHub raw 的 wasm，保证同源取回；
// 2) /__probe 返回探针信息，便于逐步排查加载状态。

import createPHP from '../scripts/php_8_4.js';

function resolveWasmURL(p: string, reqURL: URL): string {
  // 优先尝试 import.meta.url（浏览器/部分打包器可用）
  try {
    // @ts-ignore
    const base: string | null = (typeof import !== 'undefined' && typeof (import.meta) !== 'undefined' && (import.meta as any).url)
      ? (import.meta as any).url
      : null;
    if (base) {
      return new URL(`../scripts/${p}`, base).href;
    }
  } catch {
    // ignore
  }
  // 回退到同源绝对地址（适用于 Cloudflare Workers）
  return `${reqURL.origin}/scripts/${p}`;
}

// 如需锁定版本，建议把 main 换成某个 commit SHA，便于稳定复现。
// 例如：
// const WASM_UPSTREAM = 'https://raw.githubusercontent.com/szzdmj/wasmphp/<COMMIT_SHA>/scripts/php_8_4.wasm';
const WASM_UPSTREAM = 'https://raw.githubusercontent.com/szzdmj/wasmphp/main/scripts/php_8_4.wasm';

export default {
  async fetch(request: Request): Promise<Response> {
    const url = new URL(request.url);

    // 健康检查
    if (url.pathname === '/health') {
      return new Response('ok', { headers: { 'content-type': 'text/plain' } });
    }

    // 反代 wasm 到同源路径，避免直接依赖 import.meta.url/相对路径
    if (url.pathname === '/scripts/php_8_4.wasm') {
      const upstream = WASM_UPSTREAM;
      const res = await fetch(upstream, {
        // @ts-ignore 启用 CF 边缘缓存（可选）
        cf: { cacheTtl: 300, cacheEverything: true }
      });
      if (!res.ok) {
        return new Response(`Upstream wasm fetch failed: ${res.status}`, { status: 502 });
      }
      const body = await res.arrayBuffer();
      return new Response(body, {
        headers: {
          'content-type': 'application/wasm',
          // 尽量让客户端缓存，降低重复抓取成本
          'cache-control': 'public, max-age=300'
        }
      });
    }

    // 轻量探针：查看 import.meta.url 是否存在、wasm 定位 URL、以及该 URL 的响应状态
    if (url.pathname === '/__probe') {
      const wasmURL = resolveWasmURL('php_8_4.wasm', url);
      const probeRes = await fetch(wasmURL, { method: 'GET' }).catch((e) => e as Error);
      let status = -1;
      let headers: Record<string, string> = {};
      let err: string | null = null;

      if (probeRes instanceof Response) {
        status = probeRes.status;
        for (const [k, v] of probeRes.headers.entries()) headers[k] = v;
      } else if (probeRes instanceof Error) {
        err = probeRes.stack || probeRes.message;
      }

      // @ts-ignore
      const importMetaUrl = (typeof import !== 'undefined' && typeof (import.meta) !== 'undefined') ? (import.meta as any).url : undefined;

      const payload = {
        importMetaUrlPresent: typeof importMetaUrl === 'string',
        importMetaUrl: importMetaUrl || null,
        resolvedWasmURL: wasmURL,
        fetchStatus: status,
        fetchHeaders: headers,
        fetchError: err
      };
      return new Response(JSON.stringify(payload, null, 2), { headers: { 'content-type': 'application/json; charset=utf-8' } });
    }

    // 正常执行路径：保持 locateFile 机制，只是把 import.meta.url 的用法改为安全分支
    let out = '';
    try {
      const wasmURL = resolveWasmURL('php_8_4.wasm', url);

      const php = await createPHP({
        locateFile: (p: string) => {
          // 仅当 Emscripten 请求 .wasm 时才返回我们构造的同源 URL。其他文件保持默认行为。
          if (p.endsWith('.wasm')) return `${url.origin}/scripts/${p}`;
          return p;
        },
        print: (txt: string) => { out += txt + '\n'; },
        printErr: (txt: string) => { out += '[stderr] ' + txt + '\n'; }
      });

      if (url.pathname === '/info') {
        php.callMain(['-r', 'phpinfo();']);
      } else {
        // 可通过 ?code= 传入 PHP 片段，便于测试
        const code = url.searchParams.get('code') ?? 'echo "Hello from PHP WASM in Cloudflare Worker\\n";';
        php.callMain(['-r', code]);
      }

      return new Response(out, {
        headers: {
          'content-type': 'text/plain; charset=utf-8',
          // 回显本次使用的 wasm URL，便于线上快速核对
          'x-wasm-url': wasmURL
        }
      });
    } catch (e: any) {
      const msg = e?.stack || String(e);
      return new Response('Runtime error:\n' + msg, {
        status: 500,
        headers: { 'content-type': 'text/plain; charset=utf-8' }
      });
    }
  }
};
