// 保持“早上的代码状态”：主路径仍使用 import.meta.url 的 locateFile（方便复现当前错误）。
// 最小增量：
// 1) 新增 /scripts/php_8_4.wasm 路由，把 GitHub raw 的 wasm 反代到同源，供探针与后续切换使用；
// 2) 新增 /__probe 探针，显示 import.meta.url 可用性、两种候选 wasm URL 及抓取结果；
// 3) 新增 /health 健康检查。
// 注意：这版不会改变主路径行为（依旧可能因 import.meta.url 在 Worker 环境下不可用而报错），
// 目的是先把探针打通，再按你的节奏逐句修正。

import createPHP from '../scripts/php_8_4.js';

// 如需锁定版本，可将 main 替换为固定 commit SHA 以稳定复现
const WASM_UPSTREAM =
  'https://raw.githubusercontent.com/szzdmj/wasmphp/main/scripts/php_8_4.wasm';

async function tryFetch(urlStr: string): Promise<{
  ok: boolean;
  status: number;
  contentType: string | null;
  contentLength: string | null;
  error: string | null;
}> {
  try {
    const r = await fetch(urlStr, { method: 'GET' });
    return {
      ok: r.ok,
      status: r.status,
      contentType: r.headers.get('content-type'),
      contentLength: r.headers.get('content-length'),
      error: null,
    };
  } catch (e: any) {
    return {
      ok: false,
      status: -1,
      contentType: null,
      contentLength: null,
      error: e?.stack || String(e),
    };
  }
}

export default {
  async fetch(request: Request): Promise<Response> {
    const url = new URL(request.url);

    // 健康检查
    if (url.pathname === '/health') {
      return new Response('ok', { headers: { 'content-type': 'text/plain' } });
    }

    // 将仓库中的 wasm 反代为同源路径，供 locateFile/probe 使用
    if (url.pathname === '/scripts/php_8_4.wasm') {
      const upstream = WASM_UPSTREAM;
      const res = await fetch(upstream, {
        // @ts-ignore 启用 Cloudflare 边缘缓存（可选）
        cf: { cacheTtl: 300, cacheEverything: true },
      });
      if (!res.ok) {
        return new Response(`Upstream wasm fetch failed: ${res.status}`, { status: 502 });
      }
      const body = await res.arrayBuffer();
      return new Response(body, {
        headers: {
          'content-type': 'application/wasm',
          'cache-control': 'public, max-age=300',
        },
      });
    }

    // 探针：检查 import.meta.url 与两种候选 wasm URL 的可达性
    if (url.pathname === '/__probe') {
      let importMetaUrl: string | null = null;
      try {
        // 某些环境 import.meta 存在但无 url；用可选链避免抛错
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        importMetaUrl = (import.meta as any)?.url ?? null;
      } catch {
        importMetaUrl = null;
      }

      // 基于 import.meta.url 计算的候选 URL（如果可用）
      let wasmURL_from_importMeta: string | null = null;
      if (importMetaUrl) {
        try {
          wasmURL_from_importMeta = new URL('../scripts/php_8_4.wasm', importMetaUrl).href;
        } catch {
          wasmURL_from_importMeta = null;
        }
      }

      // 基于当前请求 origin 的同源 URL（由上面的反代路由提供）
      const wasmURL_from_origin = `${url.origin}/scripts/php_8_4.wasm`;

      // 分别尝试抓取
      const fetch_from_importMeta = wasmURL_from_importMeta
        ? await tryFetch(wasmURL_from_importMeta)
        : {
            ok: false,
            status: -1,
            contentType: null,
            contentLength: null,
            error: 'import.meta.url unavailable',
          };

      const fetch_from_origin = await tryFetch(wasmURL_from_origin);

      const payload = {
        importMetaUrlPresent: typeof importMetaUrl === 'string',
        importMetaUrl,
        wasmURL_from_importMeta,
        wasmURL_from_origin,
        fetch_from_importMeta: {
          tried: !!wasmURL_from_importMeta,
          ...fetch_from_importMeta,
        },
        fetch_from_origin,
      };

      return new Response(JSON.stringify(payload, null, 2), {
        headers: { 'content-type': 'application/json; charset=utf-8' },
      });
    }

    // 正常路径：保持“早上的代码状态”（用 import.meta.url 定位 wasm），以便复现当前错误进行对照
    let out = '';
    try {
      const php = await createPHP({
        // 原始写法：基于 import.meta.url 计算 wasm 位置（错误就发生在这里）
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        locateFile: (p: string) => new URL(`../scripts/${p}`, (import.meta as any).url).href,
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
