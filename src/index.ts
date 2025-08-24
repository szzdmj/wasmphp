// V28: 探针版（不等待 onRuntimeInitialized，不会阻塞）
// - 保留 /__diag /__jsplus /__probe 诊断
// - 根路径返回诊断信息，提示需要单线程构建

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

    if (url.pathname === "/__ping") return new Response("pong");

    if (url.pathname === "/__diag") {
      try {
        const wasmMod = await import("../scripts/php_8_4.wasm");
        const raw = (wasmMod as any).default;
        const normalized = await normalizeWasmModule(raw);
        return new Response(JSON.stringify({
          imported: !!raw,
          type: raw?.constructor?.name || typeof raw,
          normalized: normalized?.constructor?.name
        }), { headers: { "content-type": "application/json" } });
      } catch (e: any) {
        return new Response(JSON.stringify({ imported: false, error: e?.message || String(e) }), {
          status: 500, headers: { "content-type": "application/json" }
        });
      }
    }

    if (url.pathname === "/__jsplus") {
      const jsMod = await import("../scripts/php_8_4.js");
      return new Response(JSON.stringify({
        exportKeys: keysOf(jsMod),
        dependencyFilename: briefType((jsMod as any).dependencyFilename),
        dependenciesTotalSize: (jsMod as any).dependenciesTotalSize ?? null,
        init: briefType((jsMod as any).init),
      }), { headers: { "content-type": "application/json" } });
    }

    if (url.pathname === "/__probe") {
      try {
        const jsMod = await import("../scripts/php_8_4.js");
        const init: any = (jsMod as any).init;
        const dep: any = (jsMod as any).dependencyFilename;
        const depSize: any = (jsMod as any).dependenciesTotalSize;

        const wasmMod = await import("../scripts/php_8_4.wasm");
        const wasmModule = await normalizeWasmModule((wasmMod as any).default);

        const stdout: string[] = [];
        const stderr: string[] = [];
        const moduleOptions: any = {
          noInitialRun: true,
          print: (txt: string) => { try { stdout.push(String(txt)); } catch {} },
          printErr: (txt: string) => { try { stderr.push(String(txt)); } catch {} },
          onAbort: (reason: any) => { try { stderr.push("[abort] " + String(reason)); } catch {} },
          locateFile: (path: string, base?: string) => {
            try { stderr.push("[locateFile] " + path + " base=" + (base || "")); } catch {}
            return path;
          },
          instantiateWasm: (imports: WebAssembly.Imports, ok: (inst: WebAssembly.Instance) => void) => {
            const instance = new WebAssembly.Instance(wasmModule, imports);
            ok(instance);
            return instance.exports as any;
          },
        };

        const attempts: Array<{ label: string, call: () => any }> = [
          { label: "init(dep, options)", call: () => init(dep, { ...moduleOptions }) },
          { label: "init(options)", call: () => init({ ...moduleOptions }) },
          { label: "init('WORKER', options)", call: () => init("WORKER", { ...moduleOptions }) },
          { label: "init(dep, depSize)", call: () => init(dep, depSize) },
          { label: "init(depSize, dep)", call: () => init(depSize, dep) },
          { label: "init(dep, depSize, options)", call: () => init(dep, depSize, { ...moduleOptions }) },
          { label: "init(depSize, options)", call: () => init(depSize, { ...moduleOptions }) },
          { label: "init({ ...options, locateFile: () => String(dep) })", call: () => init({ ...moduleOptions, locateFile: () => String(dep) }) },
        ];

        const probe: any[] = [];
        for (const a of attempts) {
          try {
            let res = a.call();
            if (res && typeof res.then === "function") res = await res;
            if (typeof res === "function") {
              let tmp = res({ ...moduleOptions });
              res = (tmp && typeof tmp.then === "function") ? await tmp : tmp;
            }
            // 不等待 runtime，就直接记录
            probe.push({ label: a.label, result: briefType(res), keys: keysOf(res) });
          } catch (e: any) {
            probe.push({ label: a.label, error: e?.message || String(e) });
          }
        }

        return new Response(JSON.stringify({
          dep: briefType(dep),
          depSize,
          attempts: probe,
          stderr,
          hint: "当前构建很可能启用了 pthreads/PROXY_TO_PTHREAD，需改用单线程构建"
        }, null, 2), { headers: { "content-type": "application/json" } });
      } catch (e: any) {
        return new Response("Runtime error: " + (e?.stack || e?.message || String(e)), {
          status: 500, headers: { "content-type": "text/plain; charset=utf-8" }
        });
      }
    }

    // 根路径：直接提示需要单线程构建
    return new Response(
      "Need non-pthread build: current Emscripten module never reaches onRuntimeInitialized in Cloudflare Workers.\n" +
      "请使用单线程构建（禁用 USE_PTHREADS/PROXY_TO_PTHREAD），然后再访问此路径运行 phpinfo()。",
      { status: 503, headers: { "content-type": "text/plain; charset=utf-8" } }
    );
  }
};
