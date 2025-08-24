// 将仓库中的 wasm 反代为同源路径，供 locateFile/probe 使用
    if (url.pathname === '/scripts/php_8_4.wasm') {
  // 建议锁定为固定 commit，便于稳定复现；先用 main 测通再锁定
  const upstream = 'https://raw.githubusercontent.com/szzdmj/wasmphp/main/scripts/php_8_4.wasm';
  const res = await fetch(upstream, {
    // @ts-ignore Cloudflare 缓存（可选）
    cf: { cacheTtl: 300, cacheEverything: true }
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

    // 你的探针路由（保持你现有的返回结构）
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
        fetchError: err,
      };
      return new Response(JSON.stringify(payload, null, 2), {
        headers: { 'content-type': 'application/json; charset=utf-8' },
      });
    }

    // 保持原始实现：locateFile 使用 import.meta.url（当前错误的复现场景）
    let out = '';
    try {
      const php = await createPHP({
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
