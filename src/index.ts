// Minimal worker for single-thread PHP Wasm on Cloudflare Workers.

async function normalizeWasmModule(wasmDefault: any): Promise<WebAssembly.Module> {
  if (wasmDefault && wasmDefault.constructor?.name === "Module") return wasmDefault as WebAssembly.Module;
  const bytes: ArrayBuffer | null =
    wasmDefault instanceof ArrayBuffer
      ? wasmDefault
      : (ArrayBuffer.isView(wasmDefault) ? (wasmDefault as ArrayBufferView).buffer : null);
  if (bytes) return await WebAssembly.compile(bytes);
  throw new Error("Unsupported wasm default export type: " + (wasmDefault?.constructor?.name || typeof wasmDefault));
}

export default {
  async fetch(req: Request): Promise<Response> {
    const url = new URL(req.url);
    if (!(url.pathname === "/" || url.pathname === "/index.php")) {
      return new Response("OK", { headers: { "content-type": "text/plain; charset=utf-8" } });
    }

    try {
      const jsMod = await import("../scripts/php_8_4.js");
      const initCandidate = (jsMod as any).init || (jsMod as any).default || (jsMod as any);
      if (typeof initCandidate !== "function") {
        return new Response("Runtime error: PHP init function not found", { status: 500 });
      }

      const wasmMod = await import("../scripts/php_8_4.wasm");
      const wasmModule = await normalizeWasmModule((wasmMod as any).default);

      const stdout: string[] = [];
      const stderr: string[] = [];

      const moduleOptions: any = {
        noInitialRun: true,
        print: (txt: string) => { try { stdout.push(String(txt)); } catch {} },
        printErr: (txt: string) => { try { stderr.push(String(txt)); } catch {} },
        onAbort: (reason: any) => { try { stderr.push("[abort] " + String(reason)); } catch {} },
        instantiateWasm: (
          imports: WebAssembly.Imports,
          successCallback: (instance: WebAssembly.Instance) => void
        ) => {
          const instance = new WebAssembly.Instance(wasmModule, imports);
          successCallback(instance);
          return instance.exports as any;
        }
      };

      // 单线程构建的标准初始化：init(options) 或 init("WORKER", options)
      let ret: any;
      try {
        ret = initCandidate(moduleOptions);
      } catch {
        ret = initCandidate("WORKER", moduleOptions);
      }
      const php: any = ret && typeof ret.then === "function" ? await ret : ret;

      if (!php || typeof php.callMain !== "function") {
        const keys = (() => { try { return Object.keys(php || {}); } catch { return []; } })();
        return new Response(
          "Runtime error: Emscripten init did not return expected Module.\n" +
          `typeof php=${typeof php}, keys=${JSON.stringify(keys)}`,
          { status: 500, headers: { "content-type": "text/plain; charset=utf-8" } }
        );
      }

      try {
        php.callMain(["-r", "phpinfo();"]);
      } catch (e: any) {
        stderr.push("[callMain] " + (e?.message || String(e)));
      }

      const body = stdout.length ? stdout.join("\n") : (stderr.length ? stderr.join("\n") : "No output");
      const status = stdout.length ? 200 : (stderr.length ? 500 : 204);
      return new Response(body, {
        status,
        headers: { "content-type": stdout.length ? "text/html; charset=utf-8" : "text/plain; charset=utf-8" }
      });
    } catch (e: any) {
      const msg = e?.stack || e?.message || String(e);
      return new Response("Runtime error: " + msg, { status: 500, headers: { "content-type": "text/plain; charset=utf-8" } });
    }
  }
};
