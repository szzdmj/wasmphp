export default {
  async fetch(request: Request, env: { PHP_WASM: WebAssembly.Module }): Promise<Response> {
    try {
      const url = new URL(request.url);
      const isPhpRoute = url.pathname === "/" || url.pathname === "/index.php";
      if (!isPhpRoute) {
        return new Response("PHP WASM initialized", {
          headers: { "content-type": "text/plain; charset=utf-8" }
        });
      }

      // 仅动态导入 Emscripten JS，任何顶层异常都会变成 Promise 拒绝并被捕获
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
        onAbort: (reason: any) => { try { stderr.push("[abort] " + String(reason)); } catch {} },

        // 核心：使用 Cloudflare 提供的 WebAssembly.Module 同步实例化，完全避免外部 fetch/二进制导入
        instantiateWasm: (imports: WebAssembly.Imports, successCallback: (instance: WebAssembly.Instance) => void) => {
          const instance = new WebAssembly.Instance(env.PHP_WASM, imports);
          successCallback(instance);
          // Emscripten 需要返回 exports
          return (instance.exports as any);
        },
      };

      // 兼容两种 init 签名
      let php: any;
      try {
        php = await (initCandidate as any)(moduleOptions);
      } catch {
        php = await (initCandidate as any)("WORKER", moduleOptions);
      }

      await runtimeReady;

      // 只执行内联 phpinfo()，先验证运行时链路
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
