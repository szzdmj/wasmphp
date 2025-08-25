// V28: 探针版（不等待 onRuntimeInitialized，不会阻塞）
// - 保留诊断能力：/__probe /__diag /__jsplus
// - 根路径返回提示：当前产物为“线程版”，需更换为“单线程”构建后再启用执行
// - 继续提供 /scripts 和 /wasm 两个同源代理路由，便于抓取/连通性验证
// - 不调用 Emscripten 初始化，避免在当前线程版卡死或触发平台“禁止运行时代码生成”限制

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

// 轻量 polyfill：如后续路由中临时需要动态 import glue，可避免顶层读取 location/self 抛错
(function ensureGlobals() {
  const g = (globalThis as any);
  if (typeof g.location === 'undefined' || typeof g.location?.href === 'undefined') {
    try {
      Object.defineProperty(g, 'location', {
        value: { href: 'file:///' },
        configurable: true,
        enumerable: false,
        writable: false,
      });
    } catch {}
  }
  if (typeof g.self === 'undefined') {
    try {
      Object.defineProperty(g, 'self', {
        value: g,
        configurable: true,
        enumerable: false,
        writable: false,
      });
    } catch {}
  } else if (typeof g.self.location === 'undefined' && typeof g.location !== 'undefined') {
    try {
      g.self.location = g.location;
    } catch {}
  }
})();

export default {
  async fetch(request: Request): Promise<Response> {
    const url = new URL(request.url);
    const { pathname, origin } = url;

    // 健康检查
    if (pathname === '/health') {
      return textResponse('ok');
    }

    // 同源代理（便于本 Worker 内测试抓取 wasm）
    if (pathname === SCRIPTS_PATH) {
      return proxyWasm(WASM_UPSTREAM, 'scripts');
    }
    if (pathname === WASM_PATH) {
      return proxyWasm(WASM_UPSTREAM, 'wasm');
    }

    // 深度探针：网络、运行环境、import.meta 可用性
    if (pathname === '/__probe') {
      let importMetaUrl: string | null = null;
      try {
        importMetaUrl = (import.meta as any)?.url ?? null;
      } catch {
        importMetaUrl = null;
      }

      const originScripts = new URL(SCRIPTS_PATH, origin).toString();
      const originWasm = new URL(WASM_PATH, origin).toString();

      const body = {
        env: {
          esm: true,
          hasWorkerCtor: typeof (globalThis as any).Worker !== 'undefined',
          hasSharedArrayBuffer: typeof (globalThis as any).SharedArrayBuffer !== 'undefined',
          userAgentHints: (globalThis as any).navigator?.userAgent ?? null,
        },
        importMeta: {
          available: typeof import.meta !== 'undefined',
          url: importMetaUrl,
        },
        upstream: await fetchInfo(WASM_UPSTREAM),
        originScripts: await fetchInfo(originScripts),
        originWasm: await fetchInfo(originWasm),
        note: '当前使用探针版：不执行 Emscripten 初始化。请替换为“单线程”构建后再启用执行逻辑。',
      };

      return new Response(JSON.stringify(body, null, 2), {
        status: 200,
        headers: { 'content-type': 'application/json; charset=utf-8' },
      });
    }

    // JS 探针：仅测试是否能动态导入 glue 工厂函数（不调用、不实例化）
    if (pathname === '/__jsplus') {
      try {
        const mod = await import('../scripts/php_8_4.js');
        const def = (mod as any)?.default ?? null;
        const hasFactory = typeof def === 'function';
        const payload = {
          imported: true,
          hasDefaultFactory: hasFactory,
          exportKeys: Object.keys(mod || {}),
          note: '仅探测模块导出形态，不触发初始化，不实例化 Wasm。',
        };
        return new Response(JSON.stringify(payload, null, 2), {
          status: 200,
          headers: { 'content-type': 'application/json; charset=utf-8' },
        });
      } catch (e: any) {
        return textResponse('Import glue failed:\n' + (e?.stack || String(e)), 500);
      }
    }

    // 诊断页：指导下一步动作（单线程重编译）
    if (pathname === '/__diag' || pathname === '/' || pathname === '/index.php') {
      const lines: string[] = [];
      lines.push('Cloudflare Workers PHP/WASM – 探针版（V28）');
      lines.push('');
      lines.push('结论：当前仓库的 php_8_4 产物疑似为“线程版”（启用 USE_PTHREADS/PROXY_TO_PTHREAD），');
      lines.push('在 Workers 环境（无 Web Worker / SharedArrayBuffer）中会卡住初始化。');
      lines.push('');
      lines.push('下一步：请按 docs/BUILD-EMSCRIPTEN.md 重新生成“单线程”构建（禁用线程），');
      lines.push('替换 scripts/php_8_4.js 与 scripts/php_8_4.wasm 后，再切回执行逻辑。');
      lines.push('');
      lines.push('辅助路由：');
      lines.push('- /__probe   查看 import.meta 与 wasm 的连通性诊断');
      lines.push('- /__jsplus  仅导入 glue（不初始化）以检查导出形态');
      lines.push('- /scripts/php_8_4.wasm 与 /wasm/php_8_4.wasm 作为同源代理');
      lines.push('');
      lines.push('提示：若你已准备好单线程构建，请告知我恢复执行版入口的需求，我会给出补丁或提交 PR。');
      return textResponse(lines.join('\n'));
    }

    return textResponse('Not Found', 404);
  },
};
