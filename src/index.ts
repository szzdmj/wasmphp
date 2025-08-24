import wasmUrl from "../scripts/php_8_4.wasm";

export default {
  async fetch(request: Request): Promise<Response> {
    try {
      const url = new URL(request.url);
      const isPhpRoute = url.pathname === "/" || url.pathname === "/index.php";
      if (!isPhpRoute) {
        return new Response("PHP WASM initialized", {
          headers: { "content-type": "text/plain; charset=utf-8" }
        });
      }

      // 仅动态导入 JS 模块，避免对巨大 WASM 进行 __toESM 包装
      const phpModule = await import("../scripts/php_8_4.js");
      const initCandidate =
        (phpModule as any).init ||
        (phpModule as any).default ||
        (phpModule as any);

      if (typeof initCandidate !== "function") {
        return new Response("Runtime error: PHP init function not found on module export", {
          status: 500,
          headers: { "content-type": "text/plain; charset=utf-8" }
        });
      }

      const stdout: string[] = [];
      const stderr: string[] = [];

      let resolveReady: () => void = () => {};
      const runtimeReady = new Promise<void>((res) => { resolveReady = res; });

      const moduleOptions: any = {
        noInitialRun: true,
        print: (txt: string) => { try { stdout.push(String(txt)); } catch {} },
        printErr: (txt: string) => { try { stderr.push(String(txt)); } catch {} },
        onRuntimeInitialized: () => { try { resolveReady(); } catch {} },
        // 关键：把 wasm 的 URL 交给 Emscripten，让它自行 fetch 加载
        locateFile: (_path: string) => wasmUrl
      };

      let php: any;
      try {
        php = await (initCandidate as any)(moduleOptions);
      } catch {
        php = await (initCandidate as any)("WORKER", moduleOptions);
      }

      await runtimeReady;

      try {
        php.callMain(["-r", "phpinfo();"]);
      } catch (e: any) {
        if (e?.message) stderr.push("[callMain] " + e.message);
      }

      const body = stdout.length ? stdout.join("\n") : (stderr.length ? stderr.join("\n") : "");
      const status = stdout.length ? 200 : (stderr.length ? 500 : 204);
      return new Response(body, { status, headers: { "content-type": "text/html; charset=utf-8" } });
    } catch (e: any) {
      const msg = e?.stack || e?.message || String(e);
      return new Response("Runtime error: " + msg, {
        status: 500,
        headers: { "content-type": "text/plain; charset=utf-8" }
      });
    }
  }
};
