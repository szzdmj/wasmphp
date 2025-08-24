// Remove dynamic code generation and default to inline wasmBinary.
// Keep proxy routes (/scripts/php_8_4.wasm, /wasm/php_8_4.wasm) and probe (/__probe).

import createPHP from '../scripts/php_8_4_cf.js';

const JS_UPSTREAM = 'https://raw.githubusercontent.com/szzdmj/wasmphp/main/scripts/php_8_4.js';
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

function textResponse(body: string, status = 200, headers: Record<string, string> = {}) {
  return new Response(body, {
    status,
    headers: { 'content-type': 'text/plain; charset=utf-8', ...headers },
  });
}

async function proxyWasm(upstream: string, routeName: 'scripts' | 'wasm') {
  const r = await fetch(upstream, {
    // @ts-ignore allow CF cache hint
    cf: { cacheTtl: 300, cacheEverything: true },
  });
  if (!r.ok) {
    return textResponse(`Upstream fetch failed: ${r.status}`, r.status, {
      'x-worker-route': routeName,
    });
  }
  const respHeaders = new Headers(r.headers);
  respHeaders.set('content-type', 'application/wasm');
  respHeaders.set('x-worker-route', routeName);
  return new Response(r.body, { status: r.status, headers: respHeaders });
}

export default {
  async fetch(request: Request): Promise<Response> {
    const url = new URL(request.url);
    const { pathname, origin } = url;

    // Proxy routes for external download/testing
    if (pathname === SCRIPTS_PATH) {
      return proxyWasm(WASM_UPSTREAM, 'scripts');
    }
    if (pathname === WASM_PATH) {
      return proxyWasm(WASM_UPSTREAM, 'wasm');
    }

    // Probe endpoint to help diagnose environment/network
    if (pathname === '/__probe') {
      const upstream = await fetchInfo(WASM_UPSTREAM);
      const originScripts = await fetchInfo(new URL(SCRIPTS_PATH, origin).toString());
      const originWasm = await fetchInfo(new URL(WASM_PATH, origin).toString());
      const selfFetchLikelyBlocked =
        upstream.ok && (!originScripts.ok || !originWasm.ok);

      const body = {
        importMetaAvailable: typeof import.meta !== 'undefined',
        upstream,
        originScripts,
        originWasm,
        selfFetchLikelyBlocked,
      };
      return new Response(JSON.stringify(body, null, 2), {
        status: 200,
        headers: { 'content-type': 'application/json; charset=utf-8' },
      });
    }

    // Default root path: initialize PHP WASM
    // Switches:
    // - ?inline=0 -> disable inline wasmBinary (use network via locateFile)
    // - ?useUpstream=1 -> force upstream URL for locateFile
    // - ?useOrigin=scripts|wasm -> force same-origin proxy route for locateFile
    const inline = url.searchParams.get('inline') !== '0';
    const useUpstream = url.searchParams.get('useUpstream') === '1';
    const useOrigin = url.searchParams.get('useOrigin'); // 'scripts' | 'wasm' | null

    const locateFile = (p: string) => {
      if (!p.endsWith('.wasm')) return p;
      if (useOrigin === 'scripts') return new URL(SCRIPTS_PATH, origin).toString();
      if (useOrigin === 'wasm') return new URL(WASM_PATH, origin).toString();
      if (useUpstream) return WASM_UPSTREAM;
      // Fallback: upstream
      return WASM_UPSTREAM;
    };

    try {
      const opts: any = { locateFile };

      // Default inline mode: prefetch wasm and pass as wasmBinary to avoid any network
      if (inline) {
        const wasmRes = await fetch(WASM_UPSTREAM, {
          // @ts-ignore allow CF cache hint
          cf: { cacheTtl: 300, cacheEverything: true },
        });
        if (!wasmRes.ok) {
          return textResponse(`Failed to prefetch wasm: ${wasmRes.status}`, 500);
        }
        const buf = await wasmRes.arrayBuffer();
        opts.wasmBinary = new Uint8Array(buf);
      }

      // Initialize the PHP WASM module (no eval/new Function)
      const mod = await createPHP(opts);
      // If initialization reached here, Module is ready. We don't run PHP code here;
      // the goal is to prove instantiation works without dynamic code generation.
      return textResponse(
        `Hello from PHP WASM (initialized). inline=${inline ? 1 : 0}, locateFile=${locateFile(
          'php_8_4.wasm',
        )}`,
      );
    } catch (e: any) {
      const detail = e?.stack || String(e);
      return textResponse(`Initialization error:\n${detail}`, 500);
    }
  },
};
