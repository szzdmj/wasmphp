// 默认保持“早上的代码状态”：locateFile 使用 import.meta.url（便于复现当前错误）。
// 增量能力：
// - /scripts/php_8_4.wasm 与 /wasm/php_8_4.wasm：反代 GitHub raw 到同源，并加 x-worker-route 标头。
// - /__probe：检查 import.meta.url、两个同源路径、upstream，并判断是否可能触发了 Workers 的自调用保护。
// - /health：健康检查。
// - 调试开关（只有你显式加参数才生效，不改变默认行为）：
//   - ?useUpstream=1   -> locateFile 对 .wasm 走 upstream（raw.githubusercontent.com）
//   - ?useOrigin=scripts|wasm -> locateFile 对 .wasm 走同源 /scripts 或 /wasm
//   - ?inline=1        -> 预抓 upstream 的 wasm 字节并通过 wasmBinary 传给 Emscripten，彻底避免网络加载

import createPHP from '../scripts/php_8_4.js';

// 如需锁定稳定版本，建议把 main 换成固定 commit SHA
const WASM_UPSTREAM = 'https://raw.githubusercontent.com/szzdmj/wasmphp/main/scripts/php_8_4.wasm';
const SCRIPTS_PATH = '/scripts/php_8_4.wasm';
const WASM_PATH = '/wasm/php_8_4.wasm';

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

    // 反代到同源：/scripts/php_8_4.wasm
    if (url.pathname === SCRIPTS_PATH) {
      const res = await fetch(WASM_UPSTREAM, {
        // @ts-ignore 可选：开启 CF 边缘缓存
        cf: { cacheTtl: 300, cacheEverything: true },
      });
      if (!res.ok) {
        return new Response(`Upstream wasm fetch failed: ${res.status}`, {
          status: 502,
          headers: {
            'content-type': 'text/plain; charset=utf-8',
            'x-worker-route': 'scripts',
            'x-wasm-upstream-status': String(res.status),
          },
        });
      }
      const body = await res.arrayBuffer();
      return new Response(body, {
        headers: {
          'content-type': 'application/wasm',
          'cache-control': 'public, max-age=300',
          'x-worker-route': 'scripts',
          'x-wasm-upstream-status': String(res.status),
        },
      });
    }

    // 反代到同源：/wasm/php_8_4.wasm（备用路径）
    if (url.pathname === WASM_PATH) {
      const res = await fetch(WASM_UPSTREAM, {
        // @ts-ignore 可选：开启 CF 边缘缓存
        cf: { cacheTtl: 300, cacheEverything: true },
      });
      if (!res.ok) {
        return new Response(`Upstream wasm fetch failed: ${res.status}`, {
          status: 502,
          headers: {
            'content-type': 'text/plain; charset=utf-8',
            'x-worker-route': 'wasm',
            'x-wasm-upstream-status': String(res.status),
          },
        });
      }
      const body = await res.arrayBuffer();
      return new Response(body, {
        headers: {
          'content-type': 'application/wasm',
          'cache-control': 'public, max-age=300',
          'x-worker-route': 'wasm',
          'x-wasm-upstream-status': String(res.status),
        },
      });
    }

    // 探针
    if (url.pathname === '/__probe') {
      // import.meta.url 可用性
      let importMetaUrl: string | null = null;
      try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        importMetaUrl = (import.meta as any)?.url ?? null;
      } catch {
        importMetaUrl = null;
      }

      // 基于 import.meta.url 的候选
      let wasmURL_from_importMeta: string | null = null;
      if (importMetaUrl) {
        try {
          wasmURL_from_importMeta = new URL('../scripts/php_8_4.wasm', importMetaUrl).href;
        } catch {
          wasmURL_from_importMeta = null;
        }
      }

      const scriptsURL = `${url.origin}${SCRIPTS_PATH}`;
      const wasmURL = `${url.origin}${WASM_PATH}`;

      const checkScripts = await fetchInfo(`${scriptsURL}?__ping=1`);
      const checkWasm = await fetchInfo(`${wasmURL}?__ping=1`);
      const fromImportMeta = wasmURL_from_importMeta
        ? await fetchInfo(wasmURL_from_importMeta)
        : { ok: false, status: -1, headers: {}, error: 'import.meta.url unavailable' };
      const fromUpstream = await fetchInfo(WASM_UPSTREAM);

      const routeHitScripts = checkScripts.headers['x-worker-route'] === 'scripts';
      const routeHitWasm = checkWasm.headers['x-worker-route'] === 'wasm';

      // 在 Workers 中自调用同一 workers.dev 服务常见会被保护，呈现 404。根据现象给出提示标记。
      const selfFetchLikelyBlocked =
        !routeHitScripts &&
        !routeHitWasm &&
        checkScripts.status === 404 &&
        checkWasm.status === 404 &&
        fromUpstream.ok;

      const payload = {
        importMetaUrlPresent: typeof importMetaUrl === 'string',
        importMetaUrl,
        wasmURL_from_importMeta,
        scriptsURL,
        wasmURL,
        routeHitScripts,
        routeHitWasm,
        selfFetchLikelyBlocked,
        fetch_scripts: checkScripts,
        fetch_wasm: checkWasm,
        fetch_from_importMeta: fromImportMeta,
        fetch_from_upstream: fromUpstream,
      };

      return new Response(JSON.stringify(payload, null, 2), {
        headers: { 'content-type': 'application/json; charset=utf-8' },
      });
    }

    // 正常路径：默认维持 import.meta.url 的写法；仅在你显式加开关时才绕过
    let out = '';
    try {
      const useOrigin = url.searchParams.get('useOrigin'); // 'scripts' | 'wasm' | null
      const useUpstream = url.searchParams.get('useUpstream') === '1';
      const inline = url.searchParams.get('inline') === '1';

      // inline=1: 直接抓取 upstream 的 WASM 并以 wasmBinary 传入，彻底避免网络加载环节
      let wasmBinary: Uint8Array | undefined;
      if (inline) {
        const upstreamRes = await fetch(WASM_UPSTREAM, {
          // @ts-ignore 可选：缓存
          cf: { cacheTtl: 300, cacheEverything: true },
        });
        if (!upstreamRes.ok) {
          return new Response(`Prefetch upstream wasm failed: ${upstreamRes.status}`, { status: 502 });
        }
        const buf = await upstreamRes.arrayBuffer();
        wasmBinary = new Uint8Array(buf);
      }

      const php = await createPHP({
        // Emscripten 会优先使用 wasmBinary；若提供了则不会再去拉取 .wasm
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        ...(wasmBinary ? ({ wasmBinary } as any) : {}),
        locateFile: (p: string) => {
          if (p.endsWith('.wasm')) {
            if (useUpstream) return WASM_UPSTREAM;
            if (useOrigin === 'scripts') return `${url.origin}/scripts/${p}`;
            if (useOrigin === 'wasm') return `${url.origin}/wasm/${p}`;
          }
          // 原始写法：基于 import.meta.url（在 Worker 模块里会触发你当前的错误）
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          return new URL(`../scripts/${p}`, (import.meta as any).url).href;
        },
        print: (txt: string) => { out += txt + '\n'; },
        printErr: (txt: string) => { out += '[stderr] ' + txt + '\n'; },
      });

      if (url.pathname === '/info') {
        php.callMain(['-r', 'phpinfo();']);
      } else {
        const code = url.searchParams.get('code') ?? 'echo "Hello from PHP WASM in Cloudflare Worker\\n";';
        php.callMain(['-r', code]);
      }

      return new Response(out, { headers: { 'content-type': 'text/plain; charset=utf-8' } });
    } catch (e: any) {
      const msg = e?.stack || String(e);
      return new Response('Runtime error:\n' + msg, {
        status: 500,
        headers: { 'content-type': 'text/plain; charset=utf-8' },
      });
    }
  },
};
