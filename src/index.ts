// Cloudflare Workers friendly entry.
// - Prefer precompiled WASM module via env.PHP_WASM to avoid runtime codegen.
// - Keep probe and proxy routes. Falls back to network only if no binding is present.

import createPHP from '../scripts/php_8_4_cf.js';

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
    // @ts-ignore Cloudflare cache hint
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

// Provide an instantiateWasm hook that uses a precompiled WebAssembly.Module binding.
function makeInstantiateWithModule(wasmModule: WebAssembly.Module) {
  return (info: WebAssembly.Imports /* imports */, receiveInstance: (i: WebAssembly.Instance) => void) => {
    // Use synchronous instantiation so Emscripten can proceed immediately.
    const instance = new WebAssembly.Instance(wasmModule, info);
    // Returning exports synchronously is the Emscripten-supported fast path.
    return instance.exports as any;
  };
}

export default {
  async fetch(request: Request, env: any): Promise<Response> {
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
      const hasBinding = typeof env?.PHP_WASM !== 'undefined';
      const body = {
        importMetaAvailable: typeof import.meta !== 'undefined',
        hasBinding,
        upstream,
        originScripts,
        originWasm,
        note: hasBinding
          ? 'WASM will be instantiated from binding (no runtime codegen).'
          : 'No binding detected; runtime instantiation may be blocked by embedder.',
      };
      return new Response(JSON.stringify(body, null, 2), {
        status: 200,
        headers: { 'content-type': 'application/json; charset=utf-8' },
      });
    }

    // Switches retained for non-binding fallback/testing:
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
      return WASM_UPSTREAM;
    };

    try {
      const hasBinding = typeof env?.PHP_WASM !== 'undefined';
      const opts: any = { locateFile };

      if (hasBinding) {
        // Use precompiled module binding to avoid runtime code generation.
        opts.instantiateWasm = makeInstantiateWithModule(env.PHP_WASM as WebAssembly.Module);
      } else if (inline) {
        // Fallback: prefetch wasm and inline bytes (may still be blocked by embedder in some environments)
        const wasmRes = await fetch(WASM_UPSTREAM, {
          // @ts-ignore Cloudflare cache hint
          cf: { cacheTtl: 300, cacheEverything: true },
        });
        if (!wasmRes.ok) {
          return textResponse(`Failed to prefetch wasm: ${wasmRes.status}`, 500);
        }
        const buf = await wasmRes.arrayBuffer();
        opts.wasmBinary = new Uint8Array(buf);
      }

      const mod = await createPHP(opts);
      return textResponse(
        `Hello from PHP WASM (initialized). binding=${hasBinding ? 1 : 0}, inline=${inline ? 1 : 0}`,
      );
    } catch (e: any) {
      const detail = e?.stack || String(e);
      return textResponse(`Initialization error:\n${detail}`, 500);
    }
  },
};
