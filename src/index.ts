// V29: 以 options 为首参，清理错误 wasmBinary，强制走 instantiateWasm，显式等待 onRuntimeInitialized

async function normalizeWasmModule(wasmDefault: any): Promise<WebAssembly.Module> {
  if (wasmDefault && wasmDefault.constructor?.name === "Module") return wasmDefault as WebAssembly.Module;
  const bytes: ArrayBuffer | null =
    wasmDefault instanceof ArrayBuffer
      ? wasmDefault
      : (ArrayBuffer.isView(wasmDefault) ? (wasmDefault as ArrayBufferView).buffer : null);
  if (bytes) return await WebAssembly.compile(bytes);
  throw new Error("Unsupported wasm default export type: " + (wasmDefault?.constructor?.name || typeof wasmDefault));
}

function keysOf(v: any, max = 80) { try { return Object.keys(v || {}).slice(0, max); } catch { return []; } }
function briefType(v: any) {
  const t = typeof v;
  return { type: t, ctor: v?.constructor?.name || null, isFunction: t === "function", isPromise: !!v && typeof v.then === "function" };
}

async function waitOnRuntimeInitialized(mod: any, timeoutMs = 20000): Promise<boolean> {
  return new Promise((resolve) => {
    let done = false;
    const prev = mod.onRuntimeInitialized;
    mod.onRuntimeInitialized = () => {
      try { if (typeof prev === "function") prev(); } catch {}
      if (!done) { done = true; resolve(true); }
    };
    setTimeout(() => { if (!done) resolve(false); }, timeoutMs);
  });
}

export default {
  async fetch(req: Request): Promise<Response> {
    const url = new URL(req.url);

    if (!(url.pathname === "/" || url.pathname === "/index.php" || url.pathname === "/__probe")) {
      return new Response("OK", { headers: { "content-type": "text/plain; charset=utf-8" } });
    }

    try {
      // 1) 导入 JS & WASM
      const jsMod = await import("../scripts/php_8_4.js");
      const init: any = (jsMod as any).init;
      const dep: any = (jsMod as any).dependencyFilename;       // 实际是 WebAssembly.Module
      const depSize: any = (jsMod as any).dependenciesTotalSize; // 数字大小（约 19MB）
      if (typeof init !== "function") {
        return new Response("Runtime error: export 'init' not found or not a function", { status: 500 });
      }

      const wasmMod = await import("../scripts/php_8_4.wasm");
      const wasmModule = await normalizeWasmModule((wasmMod as any).default);

      // 2) Emscripten 选项（同步实例化）
      const stdout: string[] = [];
      const stderr: string[] = [];

      const instantiate = (
        imports: WebAssembly.Imports,
        ok: (inst: WebAssembly.Instance) => void
      ) => {
        const instance = new WebAssembly.Instance(wasmModule, imports);
        ok(instance);
        return instance.exports as any;
      };

      const baseOptions: any = {
        noInitialRun: true,
        print: (txt: string) => { try { stdout.push(String(txt)); } catch {} },
        printErr: (txt: string) => { try { stderr.push(String(txt)); } catch {} },
        onAbort: (reason: any) => { try { stderr.push("[abort] " + String(reason)); } catch {} },
        locateFile: (path: string, base?: string) => {
          // 仅记录是否尝试加载附加资源（理论上不会触发）
          try { stderr.push("[locateFile] " + path + " base=" + (base || "")); } catch {}
          return path;
        },
        instantiateWasm: instantiate,
      };

      // 3) 尝试多种签名（以 options 为首，避免把 wasmBinary 设成 Module）
      const attempts: Array<{ label: string; args: any[] }> = [
        { label: "init(options)", args: [ { ...baseOptions } ] },
        { label: "init(options, depSize)", args: [ { ...baseOptions }, depSize ] },
        { label: "init(options, dep)", args: [ { ...baseOptions }, dep ] },
        { label: "init(options, depSize, dep)", args: [ { ...baseOptions }, depSize, dep ] },
        { label: "init(options, dep, depSize)", args: [ { ...baseOptions }, dep, depSize ] },
        // 兜底：历史尝试里这些会返回“被修改的 options 对象”，本次会等待 onRuntimeInitialized
        { label: "init(dep, options)", args: [ dep, { ...baseOptions } ] },
        { label: "init('WORKER', options)", args: [ "WORKER", { ...baseOptions } ] },
      ];

      const probe: any[] = [];
      let php: any;

      for (const at of attempts) {
        let m: any = undefined;
        let note = "";
        try {
          const ret = init(...at.args);
          m = (ret && typeof ret.then === "function") ? await ret : ret;

          // 若返回函数，按工厂再调用一次
          if (typeof m === "function") {
            note = "returned function -> call with options";
            let tmp = m({ ...baseOptions });
            m = (tmp && typeof tmp.then === "function") ? await tmp : tmp;
          }

          // 如果回的是“被修改的 options 对象/Module 对象”，确保走 instantiateWasm 分支
          if (m && typeof m === "object") {
            try {
              if (m.wasmBinary && m.wasmBinary.constructor?.name === "Module") {
                // 删除错误类型的 wasmBinary，避免 Emscripten误用
                delete m.wasmBinary;
                note += (note ? " | " : "") + "delete wasmBinary(Module)";
              }
              // 强制我们的 instantiateWasm
              m.instantiateWasm = instantiate;
            } catch {}
          }

          // 显式等待 onRuntimeInitialized
          let ready = false;
          if (m && typeof m === "object") {
            ready = await waitOnRuntimeInitialized(m, 20000);
          }

          // 记录探针信息
          probe.push({
            label: at.label,
            note,
            result: briefType(m),
            keys: keysOf(m),
            ready,
          });

          if (ready && m && typeof m.callMain === "function") {
            php = m;
            break;
          }
        } catch (e: any) {
          probe.push({ label: at.label, error: e?.message || String(e) });
        }
      }

      if (url.pathname === "/__probe") {
        return new Response(JSON.stringify({
          dep: briefType(dep),
          depSize,
          attempts: probe,
          stderr,
        }, null, 2), { headers: { "content-type": "application/json" } });
      }

      if (!php) {
        return new Response(
          "Runtime error: Emscripten init did not return expected Module.\n" +
          JSON.stringify({ dep: briefType(dep), depSize, attempts: probe, stderr }, null, 2),
          { status: 500, headers: { "content-type": "text/plain; charset=utf-8" } }
        );
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
