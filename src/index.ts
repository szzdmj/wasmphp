// 保持“早上的结构”：使用 locateFile，但不再使用 import.meta.url，避免 undefined.href 报错。
// 最小增量：
// 1) /scripts/php_8_4.wasm 路由：同源提供 wasm（反代 GitHub raw），让 locateFile 能稳定取到；
// 2) /__probe 探针：查看将要使用的 wasm URL 及其抓取状态；
// 3) /health 健康检查。

import createPHP from '../scripts/php_8_4.js';

// 如需锁定测试版本，可把 main 换为固定 commit SHA：
// 例如：'https://raw.githubusercontent.com/szzdmj/wasmphp/<COMMIT_SHA>/scripts/php_8_4.wasm'
const WASM_UPSTREAM = 'https://raw.githubusercontent.com/szzdmj/wasmphp/main/scripts/php_8_4.wasm';

export default {
  async fetch(request: Request): Promise<Response> {
    const url = new URL(request.url);

    // 健康检查
    if (url.pathname === '/health') {
      return new Response('ok', { headers: { 'content-type': 'text/plain' } });
    }

    // 将 wasm 以同源路径提供，供 locateFile 使用
    if (url.pathname === '/scripts/php_8_4.wasm') {
      const res = await fetch(WASM_UPSTREAM, {
        // @ts-ignore 启用边缘缓存（可选）
        cf: { cacheTtl: 300, cacheEverything: true }
      });
      if (!res.ok) {
        return new Response(`Upstream wasm fetch failed: ${res.status}`, { status: 502 });
      }
      const body = await res.arrayBuffer();
      return new Response(body, {
        headers: {
          'content-type': 'application/wasm',
          'cache-control': 'public, max-age=300'
        }
      });
    }

    // 轻量探针：确认实际使用的 wasm URL 以及抓取是否正常
    if (url.pathname === '/__probe') {
      const wasmURL = `${url.origin}/scripts/php_8_4.wasm`;
      let status = -1;
      let headers: Record<string, string> = {};
      let err: string | null = null;
      try {
        const r = await fetch(wasmURL);
        status = r.status;
        for (const [k, v] of r.headers) headers[k] = v;
      } catch (e: any) {
        err = e?.stack || String(e);
      }
      const payload = {
        resolvedWasmURL: wasmURL,
        fetchStatus: status,
        fetchHeaders: headers,
        fetchError: err
      };
      return new Response(JSON.stringify(payload, null, 2), {
        headers: { 'content-type': 'application/json; charset=utf-8' }
      });
    }

    // 正常执行路径：仅对 .wasm 使用同源绝对 URL；不再依赖 import.meta.url
    let out = '';
    try {
      const php = await createPHP({
        locateFile: (p: string) => {
          if (p.endsWith('.wasm')) return `${url.origin}/scripts/${p}`;
          return p;
        },
        print: (txt: string) => { out += txt + '\n'; },
        printErr: (txt: string) => { out += '[stderr] ' + txt + '\n'; }
      });

      if (url.pathname === '/info') {
        php.callMain(['-r', 'phpinfo();']);
      } else {
        // 支持 ?code= 传 PHP 片段，默认打印一句话
        const code = url.searchParams.get('code') ?? 'echo "Hello from PHP WASM in Cloudflare Worker\\n";';
        php.callMain(['-r', code]);
      }

      return new Response(out, {
        headers: {
          'content-type': 'text/plain; charset=utf-8',
          // 回显当前使用的 wasm URL，便于线上核对
          'x-wasm-url': `${url.origin}/scripts/php_8_4.wasm`
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
