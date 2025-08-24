// 保持“早上的代码状态”：默认主路径仍使用 import.meta.url 的 locateFile（便于复现当前错误）。
// 最小增量：
// - /scripts/php_8_4.wasm：反代 GitHub raw 的 wasm 到同源，并标记响应头便于探针判定是否命中 Worker。
// - /__probe：检查 import.meta.url、同源 /scripts 路由是否生效、同源与 upstream 的抓取结果。
// - /health：健康检查。
// - 调试开关：在请求 URL 加上 ?useOrigin=1 时，locateFile 对 .wasm 改走同源路径，绕过 import.meta.url 以便验证执行链路。
//   例如：/?useOrigin=1 或 /info?useOrigin=1

import createPHP from '../scripts/php_8_4.js';

// 如需锁定稳定版本，请把 main 替换为具体 commit SHA
const WASM_UPSTREAM = 'https://raw.githubusercontent.com/szzdmj/wasmphp/main/scripts/php_8_4.wasm';
const WASM_PATH = '/scripts/php_8_4.wasm';

type FetchInfo = {
  ok: boolean;
  status: number;
  headers: Record<string, string>;
  error: string | null;
};

async function fetchInfo(urlStr: string): Promise<FetchInfo> {
  try {
    const r = await fetch(urlStr, { method: 'GET' });
    const headers: Record<string, string> = {};
    for (const [k, v] of r.headers) headers[k] = v;
    return { ok: r.ok, status: r.status, headers, error: null };
  } catch (e: any) {
    return { ok: false, status: -1, headers: {}, error: e?.stack || String(e) };
  }
}

export default {
  async fetch(request: Request): Promise<Response> {
    const url = new URL(request.url);

    // 健康检查
    if (url.pathname === '/health') {
      return new Response('ok', { headers: { 'content-type': 'text/plain' } });
    }

    // 反代仓库中的 wasm 到同源路径，供 locateFile/probe 使用
    if (url.pathname === WASM_PATH) {
      const upstream = WASM_UPSTREAM;
      const res = await fetch(upstream, {
        // @ts-ignore Cloudflare 边缘缓存（可选）
        cf: { cacheTtl: 300, cacheEverything: true },
      });
      if (!res.ok) {
        return new Response(`Upstream wasm fetch failed: ${res.status}`, {
          status: 502,
          headers: {
            'content-type': 'text/plain; charset=utf-8',
            'x-worker-route': 'true',
            'x-wasm-upstream-status': String(res.status),
          },
        });
      }
      const body = await res.arrayBuffer();
      return new Response(body, {
        headers: {
          'content-type': 'application/wasm',
          'cache-control': 'public, max-age=300',
          'x-worker-route': 'true',
          'x-wasm-upstream-status': String(res.status),
        },
      });
    }

    // 探针：检查 import.meta.url 可用性、同源路由是否生效、以及同源/上游的抓取情况
    if (url.pathname === '/__probe') {
      // 1) import.meta.url
      let importMetaUrl: string | null = null;
      try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        importMetaUrl = (import.meta as any)?.url ?? null;
      } catch {
        importMetaUrl = null;
      }

      // 2) 基于 import.meta 推导（如不可用则为 null）
      let wasmURL_from_importMeta: string | null = null;
      if (importMetaUrl) {
        try {
          wasmURL_from_importMeta = new URL('../scripts/php_8_4.wasm', importMetaUrl).href;
        } catch {
          wasmURL_from_importMeta = null;
        }
      }

      // 3) 基于同源路径
      const wasmURL_from_origin = `${url.origin}${WASM_PATH}`;

      // 4) 检查同源路由是否真的命中到 Worker（通过自定义响应头判断）
      const routeCheck = await fetchInfo(`${wasmURL_from_origin}?__ping=1`);
      const routeHit = routeCheck.headers['x-worker-route'] === 'true';

      // 5) 分别采集抓取信息
      const fromImportMeta = wasmURL_from_importMeta
        ? await fetchInfo(wasmURL_from_importMeta)
        : { ok: false, status: -1, headers: {}, error: 'import.meta.url unavailable' };

      const fromOrigin = await fetchInfo(wasmURL_from_origin);
      const fromUpstream = await fetchInfo(WASM_UPSTREAM);

      const payload = {
        importMetaUrlPresent: typeof importMetaUrl === 'string',
        importMetaUrl,
        wasmURL_from_importMeta,
        wasmURL_from_origin,
        routeHit, // true 表示 /scripts 路由已在 Worker 中生效
        fetch_from_importMeta: fromImportMeta,
        fetch_from_origin: fromOrigin,
        fetch_from_upstream: fromUpstream,
      };

      return new Response(JSON.stringify(payload, null, 2), {
        headers: { 'content-type': 'application/json; charset=utf-8' },
      });
    }

    // 正常路径：仍保持“早上的写法”，但加入一个仅用于排查的开关 ?useOrigin=1
    let out = '';
    try {
      const useOrigin = url.searchParams.get('useOrigin') === '1';

      const php = await createPHP({
        locateFile: (p: string) => {
          // 调试开关：当 ?useOrigin=1 时，仅对 .wasm 返回同源 URL，避免 import.meta.url
          if (useOrigin && p.endsWith('.wasm')) return `${url.origin}/scripts/${p}`;
          // 原始写法：基于 import.meta.url（在 Worker 模块里会触发你现在的报错）
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          return new URL(`../scripts/${p}`, (import.meta as any).url).href;
        },
        print: (txt: string) => {
          out += txt + '\n';
        },
        printErr: (txt: string) => {
          out += '[stderr] ' + txt + '\n';
        },
      });

      if (url.pathname === '/info') {
        php.callMain(['-r', 'phpinfo();']);
      } else {
        const code =
          url.searchParams.get('code') ??
          'echo "Hello from PHP WASM in Cloudflare Worker\\n";';
        php.callMain(['-r', code]);
      }

      return new Response(out, {
        headers: { 'content-type': 'text/plain; charset=utf-8' },
      });
    } catch (e: any) {
      const msg = e?.stack || String(e);
      return new Response('Runtime error:\n' + msg, {
        status: 500,
        headers: { 'content-type': 'text/plain; charset=utf-8' },
      });
    }
  },
};
