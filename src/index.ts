// 不要在顶层 import .wasm 或 php_8_4.js，全部放到 fetch 里
export default {
  async fetch(request: Request): Promise<Response> {
    try {
      const url = new URL(request.url);

      // 诊断路由：动态导入 .wasm，检查类型是否为 WebAssembly.Module
      if (url.pathname === "/__diag") {
        try {
          const wasmMod = await import("../scripts/php_8_4.wasm");
          const phpWasm = (wasmMod as any).default;
          const typeName = phpWasm?.constructor?.name || null;
          return new Response(
            JSON.stringify({ imported: !!phpWasm, type: typeName }),
            { headers: { "content-type": "application/json; charset=utf-8" } }
          );
        } catch (e: any) {
          return new Response(
            JSON.stringify({ imported: false, error: e?.message || String(e) }),
            { status: 500, headers: { "content-type": "application/json; charset=utf-8" } }
          );
        }
      }

      const isPhpRoute = url.pathname === "/" || url.pathname === "/index.php";
      if (!isPhpRoute) {
        return new Response("OK", { headers: { "content-type": "text/plain; charset=utf-8" } });
      }

      // 1) 动态导入 Emscripten JS（任何顶层异常会被 catch 到）
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

      // 2) 动态导入 .wasm（Wrangler 会把默认导出变成 WebAssembly.Module）
      const wasmMod = await import("../scripts/php_8_4.wasm");
      const phpWasm = (wasmMod as any).default;

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

        // 核心：使用预编译的 WebAssembly.Module 同步实例化，避免 fetch/内联大字节
        instantiateWasm: (
          imports: WebAssembly.Imports,
          successCallback: (instance: WebAssembly.Instance) => void
        ) => {
          const instance = new WebAssembly.Instance(phpWasm as WebAssembly.Module, imports);
          successCallback(instance);
          return instance.exports as any; // Emscripten 需要返回 exports
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

      // 仅执行内联 phpinfo()，不触碰 FS
      try {
        php.callMain(["-r", "phpinfo();"]);
      } catch (e: any) {
        if (e?.message) stderr.push("[callMain] " + e.message);
      }

      const body = stdout.length ? stdout.join("\n") : (stderr.length ? stderr.join("\n") : "");
      const status = stdout.length ? 200 : (stderr.length ? 500 : 204);
      return new Response(body, { status, headers: { "content-type": "text/html; charset=utf-8" } });
    } catch (e: any) {
      // 把异常文本返回到响应里，便于观测（避免 1101）
      const msg = e?.stack || e?.message || String(e);
      return new Response("Runtime error: " + msg, {
        status: 500,
        headers: { "content-type": "text/plain; charset=utf-8" }
      });
    }
  }
};
