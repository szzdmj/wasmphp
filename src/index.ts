export default {
  async fetch(req: Request): Promise<Response> {
    try {
      const url = new URL(req.url);

      if (url.pathname === "/__diag") {
        const wasmMod = await import("../scripts/php_8_4.wasm");
        const phpWasm = (wasmMod as any).default;
        const typeName = phpWasm?.constructor?.name || null;
        return new Response(JSON.stringify({ imported: !!phpWasm, type: typeName }), {
          headers: { "content-type": "application/json; charset=utf-8" }
        });
      }

      if (!(url.pathname === "/" || url.pathname === "/index.php")) {
        return new Response("OK", { headers: { "content-type": "text/plain; charset=utf-8" } });
      }

      // 动态导入 Emscripten JS 和 WASM（都在 try/catch 内）
      const phpModule = await import("../scripts/php_8_4.js");
      const initCandidate =
        (phpModule as any).init ||
        (phpModule as any).default ||
        (phpModule as any);
      if (typeof initCandidate !== "function") {
        return new Response("Runtime error: PHP init function not found on module export", { status: 500 });
      }
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
        instantiateWasm: (
          imports: WebAssembly.Imports,
          successCallback: (instance: WebAssembly.Instance) => void
        ) => {
          const instance = new WebAssembly.Instance(phpWasm as WebAssembly.Module, imports);
          successCallback(instance);
          return instance.exports as any;
        },
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
        stderr.push("[callMain] " + (e?.message || String(e)));
      }

      const body = stdout.length ? stdout.join("\n") : (stderr.length ? stderr.join("\n") : "No output");
      const status = stdout.length ? 200 : (stderr.length ? 500 : 204);
      return new Response(body, { status, headers: { "content-type": "text/html; charset=utf-8" } });
    } catch (e: any) {
      return new Response("Runtime error: " + (e?.stack || e?.message || String(e)), {
        status: 500,
        headers: { "content-type": "text/plain; charset=utf-8" }
      });
    }
  }
};
