export default {
  async fetch(request: Request): Promise<Response> {
    try {
      const url = new URL(request.url);
      const isPhpRoute = url.pathname === "/" || url.pathname === "/index.php";
      if (!isPhpRoute) {
        return new Response("PHP WASM initialized", {
          headers: { "content-type": "text/plain; charset=utf-8" },
        });
      }

      // 动态导入，避免顶层初始化异常导致 1101
      const [{ default: wasmBinary }, phpModule] = await Promise.all([
        import("../scripts/php_8_4.wasm"),
        import("../scripts/php_8_4.js"),
      ]);

      // 获取 init 函数（兼容不同导出方式）
      const initCandidate =
        (phpModule as any).init ||
        (phpModule as any).default ||
        phpModule;

      if (typeof initCandidate !== "function") {
        return new Response("Runtime error: PHP init function not found on module export", {
          status: 500,
          headers: { "content-type": "text/plain; charset=utf-8" },
        });
      }

      const stdout: string[] = [];
      const stderr: string[] = [];

      // 等待 Emscripten 运行时就绪
      let resolveReady: () => void = () => {};
      const runtimeReady = new Promise<void>((res) => { resolveReady = res; });

      const moduleOptions: any = {
        wasmBinary,
        noInitialRun: true,
        print: (txt: string) => { try { stdout.push(String(txt)); } catch {} },
        printErr: (txt: string) => { try { stderr.push(String(txt)); } catch {} },
        onRuntimeInitialized: () => { try { resolveReady(); } catch {} },
      };

      // 尝试两种 init 签名
      let php: any;
      try {
        php = await (initCandidate as any)(moduleOptions);
      } catch {
        php = await (initCandidate as any)("WORKER", moduleOptions);
      }

      // 确保运行时完全就绪
      await runtimeReady;

      // 仅执行内联 phpinfo()，完全绕过 FS
      try {
        php.callMain(["-r", "phpinfo();"]);
      } catch (e: any) {
        if (e?.message) stderr.push("[callMain] " + e.message);
      }

      const body = stdout.length ? stdout.join("\n") : (stderr.length ? stderr.join("\n") : "");
      const status = stdout.length ? 200 : (stderr.length ? 500 : 204);

      return new Response(body, {
        status,
        headers: { "content-type": "text/html; charset=utf-8" },
      });
    } catch (e: any) {
      const msg = e?.stack || e?.message || String(e);
      // 将所有异常包装为 500 返回，避免 1101（未捕获异常）
      return new Response("Runtime error: " + msg, {
        status: 500,
        headers: { "content-type": "text/plain; charset=utf-8" },
      });
    }
  },
};
