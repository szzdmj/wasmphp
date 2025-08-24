// Production-ready minimal worker for PHP Wasm on Cloudflare Workers.
// - 动态导入 Emscripten JS 和 .wasm，所有异常都在请求内捕获，避免 1101
// - 使用 instantiateWasm 同步实例化（无需 fetch/URL/内联大字节）
// - 兼容两种 Emscripten init 签名：init(options) 与 init("WORKER", options)
// - 仅执行 phpinfo() 作为示例，后续可改为执行用户脚本

async function normalizeWasmModule(wasmDefault: any): Promise<WebAssembly.Module> {
  if (wasmDefault && wasmDefault.constructor?.name === "Module") {
    return wasmDefault as WebAssembly.Module;
  }
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

    // 仅在根路径运行 PHP；其它路径返回健康检查
    if (!(url.pathname === "/" || url.pathname === "/index.php")) {
      return new Response("OK", { headers: { "content-type": "text/plain; charset=utf-8" } });
    }

    try {
      // 1) 动态导入 Emscripten JS
      const jsMod = await import("../scripts/php_8_4.js");
      const initCandidate =
        (jsMod as any).init ||
        (jsMod as any).default ||
        (jsMod as any);

      if (typeof initCandidate !== "function") {
        return new Response("Runtime error: PHP init function not found in module exports", {
          status: 500,
          headers: { "content-type": "text/plain; charset=utf-8" }
        });
      }

      // 2) 动态导入并规范化 .wasm
      const wasmMod = await import("../scripts/php_8_4.wasm");
      const wasmModule = await normalizeWasmModule((wasmMod as any).default);

      // 3) 设置 Emscripten 选项
      const stdout: string[] = [];
      const stderr: string[] = [];

      const moduleOptions: any = {
        noInitialRun: true,
        print: (txt: string) => { try { stdout.push(String(txt)); } catch {} },
        printErr: (txt: string) => { try { stderr.push(String(txt)); } catch {} },
        onAbort: (reason: any) => { try { stderr.push("[abort] " + String(reason)); } catch {} },

        // 核心：同步实例化，避免 fetch/URL/内联大字节
        instantiateWasm: (
          imports: WebAssembly.Imports,
          successCallback: (instance: WebAssembly.Instance) => void
        ) => {
          const instance = new WebAssembly.Instance(wasmModule, imports);
          successCallback(instance);
          return instance.exports as any; // Emscripten 需要返回 exports
        }
      };

      // 4) 初始化（兼容两种签名；若返回 Promise，等待）
      let initResult: any;
      try {
        initResult = (initCandidate as any)(moduleOptions);
      } catch {
        // 你的构建导出了 init(length=2)，通常是 (tag, options)
        initResult = (initCandidate as any)("WORKER", moduleOptions);
      }
      const php: any = initResult && typeof initResult.then === "function" ? await initResult : initResult;

      // 5) 执行 phpinfo()
      if (!php || typeof php.callMain !== "function") {
        const keys = (() => { try { return Object.keys(php || {}); } catch { return []; } })();
        const msg = [
          "Runtime error: Emscripten init did not return expected Module.",
          "typeof php=" + (typeof php) + ", ctor=" + (php?.constructor?.name || "null"),
          "keys=" + JSON.stringify(keys)
        ].join("\n");
        return new Response(msg, { status: 500, headers: { "content-type": "text/plain; charset=utf-8" } });
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
      return new Response("Runtime error: " + msg, {
        status: 500,
        headers: { "content-type": "text/plain; charset=utf-8" }
      });
    }
  }
};
