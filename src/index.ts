import phpWasm from "../scripts/php_8_4.wasm"; // 关键：ESM 直接 import .wasm（Wrangler 会预编译为 WebAssembly.Module）

export interface Env {}

export default {
  async fetch(request: Request, _env: Env): Promise<Response> {
    try {
      const url = new URL(request.url);

      // 诊断路由：检查导入的 wasm 是否是 WebAssembly.Module
      if (url.pathname === "/__diag") {
        const ok = phpWasm && (phpWasm as any).constructor?.name === "Module";
        return new Response(
          JSON.stringify({ hasPHP_WASM: ok, type: (phpWasm as any)?.constructor?.name || null }),
          { headers: { "content-type": "application/json; charset=utf-8" } }
        );
      }

      const isPhpRoute = url.pathname === "/" || url.pathname === "/index.php";
      if (!isPhpRoute) {
        return new Response("PHP WASM initialized", {
          headers: { "content-type": "text/plain; charset=utf-8" }
        });
      }

      // 动态导入 Emscripten JS（避免顶层异常变成 1101）
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

        // 核心：用 Wrangler 预编译好的 WebAssembly.Module 同步实例化，避免 fetch/URL/内联巨型字节
        instantiateWasm: (imports: WebAssembly.Imports, successCallback: (instance: WebAssembly.Instance) => void) => {
          const instance = new WebAssembly.Instance(phpWasm as unknown as WebAssembly.Module, imports);
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
      const msg = e?.stack || e?.message || String(e);
      return new Response("Runtime error: " + msg, {
        status: 500,
        headers: { "content-type": "text/plain; charset=utf-8" }
      });
    }
  }
};
