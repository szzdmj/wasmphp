// Static import of Emscripten glue code - no more dynamic code generation
// @ts-ignore - Emscripten generated module has no types
import createPHP from '../scripts/php_8_4.js';

// Upstream WASM URL for fetching the binary
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
        // @ts-ignore Cloudflare 可选缓存
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
        // @ts-ignore Cloudflare 可选缓存
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

    // 探针：保留自调用特征检测
    if (url.pathname === '/__probe') {
      let importMetaUrl: string | null = null;
      try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        importMetaUrl = (import.meta as any)?.url ?? null;
      } catch {
        importMetaUrl = null;
      }

      const scriptsURL = `${url.origin}${SCRIPTS_PATH}`;
      const wasmURL = `${url.origin}${WASM_PATH}`;

      const checkScripts = await fetchInfo(`${scriptsURL}?__ping=1`);
      const checkWasm = await fetchInfo(`${wasmURL}?__ping=1`);
      const fromUpstream = await fetchInfo(WASM_UPSTREAM);

      const routeHitScripts = checkScripts.headers['x-worker-route'] === 'scripts';
      const routeHitWasm = checkWasm.headers['x-worker-route'] === 'wasm';
      const selfFetchLikelyBlocked =
        !routeHitScripts &&
        !routeHitWasm &&
        checkScripts.status === 404 &&
        checkWasm.status === 404 &&
        fromUpstream.ok;

      const payload = {
        importMetaUrlPresent: typeof importMetaUrl === 'string',
        importMetaUrl,
        scriptsURL,
        wasmURL,
        routeHitScripts,
        routeHitWasm,
        selfFetchLikelyBlocked,
        fetch_scripts: checkScripts,
        fetch_wasm: checkWasm,
        fetch_from_upstream: fromUpstream,
      };

      return new Response(JSON.stringify(payload, null, 2), {
        headers: { 'content-type': 'application/json; charset=utf-8' },
      });
    }

    // 正常路径
    let out = '';
    try {
      const useOrigin = url.searchParams.get('useOrigin'); // 'scripts' | 'wasm' | null
      const useUpstream = url.searchParams.get('useUpstream') === '1';
      const inline = url.searchParams.get('inline') !== '0'; // Default to true (inline mode), disable with ?inline=0

      // Default inline mode: 预抓 upstream 的 WASM 并以 wasmBinary 传给 Emscripten，彻底避免网络加载
      let wasmBinary: Uint8Array | undefined;
      if (inline) {
        const upstreamRes = await fetch(WASM_UPSTREAM, {
          // @ts-ignore 可选缓存
          cf: { cacheTtl: 300, cacheEverything: true },
        });
        if (!upstreamRes.ok) {
          return new Response(`Prefetch upstream wasm failed: ${upstreamRes.status}`, { status: 502 });
        }
        const buf = await upstreamRes.arrayBuffer();
        wasmBinary = new Uint8Array(buf);
      }

      // Use static import instead of dynamic loading
      const php = await createPHP({
        // 若提供 wasmBinary，Emscripten 将不会再发起网络请求加载 .wasm
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        ...(wasmBinary ? ({ wasmBinary } as any) : {}),
        locateFile: (p: string) => {
          // 完全不再使用 import.meta.url
          if (p.endsWith('.wasm')) {
            if (useUpstream) return WASM_UPSTREAM;
            if (useOrigin === 'wasm') return `${url.origin}/wasm/${p}`;
            if (useOrigin === 'scripts') return `${url.origin}/scripts/${p}`;
            // 默认指向同源 scripts（外部访问可用；内部自调用会 404，可用开关或 inline/Upstream 绕过）
            return `${url.origin}/scripts/${p}`;
          }
          return p;
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