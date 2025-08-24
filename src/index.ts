// 保持原有结构：正常路径仍使用 import.meta.url 的 locateFile（会复现你现在的错误）。
// 仅新增：
// 1) /__probe 探针：检查 import.meta.url 是否存在、两种候选 wasm URL 以及各自抓取结果。
// 2) /scripts/php_8_4.wasm：从 GitHub raw 反代到同源，便于通过 locateFile(origin) 验证。
// 3) /health 简单健康检查。
// 说明：探针不改动正常路径逻辑（仍旧可能报 TypeError），用于逐步定位问题。

import createPHP from '../scripts/php_8_4.js';

// 将仓库里的 wasm 反代到同源（如需固定版本，可把 main 换成某个 commit SHA）
const WASM_UPSTREAM =
  'https://raw.githubusercontent.com/szzdmj/wasmphp/main/scripts/php_8_4.wasm';

type ProbeResult = {
  importMetaUrlPresent: boolean;
  importMetaUrl: string | null;
  wasmURL_from_importMeta: string | null;
  wasmURL_from_origin: string;
  fetch_from_importMeta: {
    tried: boolean;
    ok: boolean;
    status: number;
    contentType: string | null;
    contentLength: string | null;
    error: string | null;
  };
  fetch_from_origin: {
    ok: boolean;
    status: number;
    contentType: string | null;
    contentLength: string | null;
    error: string | null;
  };
};

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

    // 同源提供 wasm（反代 GitHub raw），用于探针或切换到基于 origin 的 locateFile 时使用
    if (url.pathname === '/scripts/php_8_4.wasm') {
      const upstream = WASM_UPSTREAM;
      const res = await fetch(upstream, {
        // @ts-ignore Cloudflare 边缘缓存（可选）
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

    // 探针：不触发 createPHP，单独检测 import.meta.url 与候选 wasm URL 的可达性
    if (url.pathname === '/__probe') {
      let importMetaUrl: string | null = null;
      try {
        // 在部分环境中 import.meta 可能存在但无 url 属性
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

      const payload: ProbeResult = {
        importMetaUrlPresent: typeof importMetaUrl === 'string',
        importMetaUrl,
        wasmURL_from_importMeta,
        wasmURL_from_origin,
        fetch_from_importMeta: {
          tried: !!wasmURL_from_importMeta,
          ...fetch_from_importMeta,
        } as any,
        fetch_from_origin,
      };

      return new Response(JSON.stringify(payload, null, 2), {
        headers: { 'content-type': 'application/json; charset=utf-8' },
      });
    }

    // 正常路径：保持“早上的代码状态”（用 import.meta.url 定位 wasm），
    // 以便复现你现在的错误并进行对照；异常被捕获后以 500 文本返回。
    let out = '';
    try {
      const php = await createPHP({
        // 原始写法：基于 import.meta.url 计算 wasm 位置（这正是当前报错点）
        locateFile: (p: string) => new URL(`../scripts/${p}`, (import.meta as any).url).href,
        print: (txt: string) => {
          out += txt + '\n';
        },
        printErr: (txt: string) => {
          out += '[stderr] ' + txt + '\n';
        },
      });

      // 支持 ?code= 传入 PHP 片段，默认打印一句话；/info 输出 phpinfo()
      if (url.pathname === '/info') {
        php.callMain(['-r', 'phpinfo();']);
      } else {
        const code =
          url.searchParams.get('code') ??
          'echo "Hello from PHP WASM in Cloudflare Worker\n";';
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
