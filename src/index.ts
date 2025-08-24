// V27: 兼容多种 Emscripten init 签名，优先使用 init(dependencyFilename, options)

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

    // 非根路径直接健康检查
    if (!(url.pathname === "/" || url.pathname === "/index.php")) {
      return new Response("OK", { headers: { "content-type": "text/plain; charset=utf-8" } });
    }

    try {
      // 1) 动态导入 JS（拿到 init 和 dependencyFilename）
      const jsMod = await import("../scripts/php_8_4.js");
      const init: any = (jsMod as any).init;
      const dep: any = (jsMod as any).dependencyFilename;

      if (typeof init !== "function") {
        return new Response("Runtime error: export 'init' not found or not a function", {
          status: 500,
          headers: { "content-type": "text/plain; charset=utf-8" }
        });
      }

      // 2) 动态导入并规范化 .wasm
      const wasmMod = await import("../scripts/php_8_4.wasm");
      const wasmModule = await normalizeWasmModule((wasmMod as any).default);

      // 3) Emscripten 选项（同步实例化，避免 fetch/URL）
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
        },
      };

      // 4) 依次尝试几种已知签名
      const attempts: Array<() => any> = [
        () => init(dep, moduleOptions),                                  // 常见：init(wasmUrl, options)
        () => init(moduleOptions),                                       // Emscripten MODULARIZE 常见：init(options)
        () => init("WORKER", moduleOptions),                             // 某些构建：init(tag, options)
        () => init({ ...moduleOptions, locateFile: () => String(dep) }), // 通过 locateFile 提供 wasm 路径
      ];

      let php: any = undefined;
      const attemptErrors: string[] = [];
      for (const fn of attempts) {
        try {
          const res = fn();
          php = (res && typeof res.then === "function") ? await res : res;
          if (php && typeof php.callMain === "function") break;
        } catch (e: any) {
          attemptErrors.push(e?.message || String(e));
          php = undefined;
        }
      }

      if (!php || typeof php.callMain !== "function") {
        // 回显我们尝试过的方法，便于进一步定位
        const info = {
          depType: typeof dep,
          hasDep: !!dep,
          depCtor: (dep as any)?.constructor?.name || null,
          attempts: attemptErrors,
          phpType: typeof php,
          phpCtor: php?.constructor?.name || null,
          phpKeys: (() => { try { return Object.keys(php || {}); } catch { return []; } })(),
        };
        return new Response(
          "Runtime error: Emscripten init did not return expected Module.\n" + JSON.stringify(info, null, 2),
          { status: 500, headers: { "content-type": "text/plain; charset=utf-8" } }
        );
      }

      // 5) 执行 phpinfo()
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
