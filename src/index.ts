// V28: 穷举 init 签名，自动识别返回值（Promise/Function/Module），并记录探测结果

async function normalizeWasmModule(wasmDefault: any): Promise<WebAssembly.Module> {
  if (wasmDefault && wasmDefault.constructor?.name === "Module") return wasmDefault as WebAssembly.Module;
  const bytes: ArrayBuffer | null =
    wasmDefault instanceof ArrayBuffer
      ? wasmDefault
      : (ArrayBuffer.isView(wasmDefault) ? (wasmDefault as ArrayBufferView).buffer : null);
  if (bytes) return await WebAssembly.compile(bytes);
  throw new Error("Unsupported wasm default export type: " + (wasmDefault?.constructor?.name || typeof wasmDefault));
}

function briefType(v: any) {
  const t = typeof v;
  const ctor = v?.constructor?.name || null;
  return { type: t, ctor, isFunction: t === "function", isPromise: !!v && typeof v.then === "function" };
}

function keysOf(v: any, max = 50) { try { return Object.keys(v || {}).slice(0, max); } catch { return []; } }

export default {
  async fetch(req: Request): Promise<Response> {
    const url = new URL(req.url);

    // 健康检查
    if (url.pathname === "/__ping") return new Response("pong");

    // 探测导出信息
    if (url.pathname === "/__jsplus") {
      const jsMod = await import("../scripts/php_8_4.js");
      return new Response(JSON.stringify({
        exportKeys: keysOf(jsMod),
        dependencyFilename: briefType((jsMod as any).dependencyFilename),
        dependenciesTotalSize: (jsMod as any).dependenciesTotalSize ?? null,
        init: briefType((jsMod as any).init),
      }), { headers: { "content-type": "application/json" } });
    }

    // 仅根路径执行
    if (!(url.pathname === "/" || url.pathname === "/index.php" || url.pathname === "/__probe")) {
      return new Response("OK", { headers: { "content-type": "text/plain; charset=utf-8" } });
    }

    try {
      // 1) 导入 JS & WASM
      const jsMod = await import("../scripts/php_8_4.js");
      const init: any = (jsMod as any).init;
      const dep: any = (jsMod as any).dependencyFilename;
      const depSize: any = (jsMod as any).dependenciesTotalSize;
      if (typeof init !== "function") {
        return new Response("Runtime error: export 'init' not found or not a function", { status: 500 });
      }

      const wasmMod = await import("../scripts/php_8_4.wasm");
      const wasmModule = await normalizeWasmModule((wasmMod as any).default);

      // 2) Emscripten 选项
      const stdout: string[] = [];
      const stderr: string[] = [];
      const moduleOptions: any = {
        noInitialRun: true,
        print: (txt: string) => { try { stdout.push(String(txt)); } catch {} },
        printErr: (txt: string) => { try { stderr.push(String(txt)); } catch {} },
        onAbort: (reason: any) => { try { stderr.push("[abort] " + String(reason)); } catch {} },
        locateFile: (path: string, base?: string) => {
          // 仅记录是否请求额外资源（.data/.mem 等）
          try { stderr.push("[locateFile] " + path + " base=" + (base || "")); } catch {}
          return path;
        },
        instantiateWasm: (imports: WebAssembly.Imports, ok: (inst: WebAssembly.Instance) => void) => {
          const instance = new WebAssembly.Instance(wasmModule, imports);
          ok(instance);
          return instance.exports as any;
        },
      };

      // 3) 尝试多种签名
      const attempts: Array<{ label: string, call: () => any }> = [
        { label: "init(dep, options)", call: () => init(dep, moduleOptions) },
        { label: "init(options)", call: () => init(moduleOptions) },
        { label: "init('WORKER', options)", call: () => init("WORKER", moduleOptions) },
        { label: "init(dep, depSize)", call: () => init(dep, depSize) },
        { label: "init(depSize, dep)", call: () => init(depSize, dep) },
        { label: "init(dep, depSize, options)", call: () => init(dep, depSize, moduleOptions) },
        { label: "init(depSize, options)", call: () => init(depSize, moduleOptions) },
        { label: "init({ ...options, locateFile: () => String(dep) })", call: () => init({ ...moduleOptions, locateFile: () => String(dep) }) },
      ];

      const probe: any[] = [];
      let php: any;

      for (const a of attempts) {
        let res: any;
        let note = "";
        try {
          res = a.call();
          if (res && typeof res.then === "function") {
            note = "awaiting promise";
            res = await res;
          }
          // 若返回函数，再用 options 调用一次（可能是工厂）
          if (typeof res === "function") {
            note = (note ? note + " -> " : "") + "calling returned function with options";
            let tmp = res(moduleOptions);
            if (tmp && typeof tmp.then === "function") tmp = await tmp;
            res = tmp;
          }
          // 记录
          probe.push({ label: a.label, result: briefType(res), keys: keysOf(res) });
          // 成功条件
          if (res && typeof res.callMain === "function") { php = res; break; }
        } catch (e: any) {
          probe.push({ label: a.label, error: e?.message || String(e) });
        }
      }

      // 专用探测路由
      if (url.pathname === "/__probe") {
        return new Response(JSON.stringify({
          dep: briefType(dep),
          depSize,
          attempts: probe,
          stderr,
        }, null, 2), { headers: { "content-type": "application/json" } });
      }

      if (!php || typeof php.callMain !== "function") {
        return new Response("Runtime error: Emscripten init did not return expected Module.\n" +
          JSON.stringify({ dep: briefType(dep), depSize, attempts: probe, stderr }, null, 2),
          { status: 500, headers: { "content-type": "text/plain; charset=utf-8" } });
      }

      // 4) 执行 phpinfo()
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
      return new Response("Runtime error: " + (e?.stack || e?.message || String(e)), {
        status: 500,
        headers: { "content-type": "text/plain; charset=utf-8" }
      });
    }
  }
};
