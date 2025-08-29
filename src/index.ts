// --- main fetch handler ---
export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    const { pathname } = url;

    if (pathname === "/health") return textResponse("ok");

    if (pathname === "/__jsplus") {
      try {
        const mod = await import("../php_8_4.js"); // 恢复原路径
        const def = (mod as any)?.default ?? null;
        const hasFactory = typeof def === "function";
        const payload = {
          imported: true,
          hasDefaultFactory: hasFactory,
          exportKeys: Object.keys(mod || {}),
          note: "import-only, no init",
        };
        return new Response(JSON.stringify(payload, null, 2), {
          status: 200,
          headers: { "content-type": "application/json; charset=utf-8" },
        });
      } catch (e: any) {
        return textResponse("Import glue failed:\n" + (e?.stack || String(e)), 500);
      }
    }

    if (pathname === "/run" && request.method === "GET") return routeRunGET(url);

    // --- 恢复之前可用版本逻辑 ---
    if (pathname === "/" || pathname === "/index.php") {
      try {
        const key = "public/index.php";
        let codeNormalized: string | undefined;

        // 只从 KV 或 GitHub 取，顺序保持和之前版本一致
        if (env?.SRC) {
          const kv = await fetchKVPhpSource(env, key);
          if (kv.ok) codeNormalized = kv.code;
        }

        if (!codeNormalized) {
          const gh = await fetchGithubPhpSource("szzdmj", "wasmphp", key);
          if (!gh.ok) return textResponse(gh.err || "Fetch error", 502);
          codeNormalized = gh.code;
        }

        // 直接 eval PHP，保持之前版本风格，不 wrap shutdown
        const argv = buildArgvForCode(codeNormalized || "");
        const res = await runAuto(argv, 10000);
        return finalizeOk(url, res, "text/html; charset=utf-8");
      } catch (e: any) {
        return textResponse("Internal error:\n" + (e?.stack || String(e)), 500);
      }
    }

    return textResponse("Not Found", 404);
  },
};
