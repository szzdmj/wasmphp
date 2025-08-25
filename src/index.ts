// V31 执行版：在具备“单线程”构建的前提下运行 phpinfo()
// - 直接 ESM import .wasm（Wrangler 产出 WebAssembly.Module），通过 instantiateWasm 同步实例化
// - 动态导入 glue（避免对巨大 wasm 做 __toESM 包装）
// - 含安全超时，若误用线程版不会阻塞请求
// - 保留 /__probe /__jsplus 诊断

import wasmAsset from "../scripts/php_8_4.wasm";

(function ensureGlobals() {
  const g = globalThis as any;
  if (typeof g.location === "undefined" || typeof g.location?.href === "undefined") {
    try {
      Object.defineProperty(g, "location", {
        value: { href: "file:///" },
        configurable: true,
        enumerable: false,
        writable: false,
      });
    } catch {}
  }
  if (typeof g.self === "undefined") {
    try {
      Object.defineProperty(g, "self", {
        value: g,
        configurable: true,
        enumerable: false,
        writable: false,
      });
    } catch {}
  } else if (typeof g.self.location === "undefined" && typeof g.location !== "undefined") {
    try {
      g.self.location = g.location;
    } catch {}
  }
})();

function isWasmModule(x: any): x is WebAssembly.Module {
  return Object.prototype.toString.call(x) === "[object WebAssembly.Module]";
}
function makeInstantiateWithModule(wasmModule: WebAssembly.Module) {
  return (imports: WebAssembly.Imports, _cb: (i: WebAssembly.Instance) => void) => {
    const instance = new WebAssembly.Instance(wasmModule, imports);
    return instance.exports as any;
  };
}
function textResponse(body: string, status = 200, headers: Record<string, string> = {}) {
  return new Response(body, {
    status,
    headers: { "content-type": "text/plain; charset=utf-8", ...headers },
  });
}
async function buildModuleOptions(): Promise<any> {
  const opts: any = {
    noInitialRun: true,
    print: () => {},
    printErr: () => {},
    onRuntimeInitialized: () => {},
  };
  if (isWasmModule(wasmAsset)) {
    opts.instantiateWasm = makeInstantiateWithModule(wasmAsset as WebAssembly.Module);
    return opts;
  }
  if (typeof wasmAsset === "string") {
    const res = await fetch(wasmAsset);
    if (!res.ok) throw new Error(`Failed to fetch wasm from URL: ${res.status}`);
    const buf = await res.arrayBuffer();
    opts.wasmBinary = new Uint8Array(buf);
    return opts;
  }
  if (wasmAsset instanceof ArrayBuffer) {
    opts.wasmBinary = new Uint8Array(wasmAsset);
    return opts;
  }
  if (ArrayBuffer.isView(wasmAsset)) {
    const view = wasmAsset as ArrayBufferView;
    opts.wasmBinary = new Uint8Array(view.buffer, view.byteOffset, view.byteLength);
    return opts;
  }
  throw new Error("Unsupported wasm asset type at runtime");
}

async function runPhpInfo(): Promise<{ body: string; status: number; contentType: string }> {
  const phpModule = await import("../scripts/php_8_4.js");
  const initCandidate =
    (phpModule as any).init || (phpModule as any).default || (phpModule as any);
  if (typeof initCandidate !== "function") {
    return {
      body: "Runtime error: PHP init function not found on module export",
      status: 500,
      contentType: "text/plain; charset=utf-8",
    };
  }

  const stdout: string[] = [];
  const stderr: string[] = [];
  let resolveReady: () => void = () => {};
  const runtimeReady = new Promise<void>((res) => (resolveReady = res));

  const moduleOptions = await buildModuleOptions();
  moduleOptions.print = (txt: string) => { try { stdout.push(String(txt)); } catch {} };
  moduleOptions.printErr = (txt: string) => { try { stderr.push(String(txt)); } catch {} };
  moduleOptions.onRuntimeInitialized = () => { try { resolveReady(); } catch {} };

  let php: any;
  try {
    php = await (initCandidate as any)(moduleOptions);
  } catch {
    php = await (initCandidate as any)("WORKER", moduleOptions);
  }

  // 安全超时，避免误用线程版时卡住请求
  const READY_TIMEOUT_MS = 3000;
  const ready = await Promise.race([
    runtimeReady.then(() => true),
    new Promise<boolean>((res) => setTimeout(() => res(false), READY_TIMEOUT_MS)),
  ]);
  if (!ready) {
    const hint =
      "Emscripten runtime not initialized within timeout. Ensure the WASM build is single-threaded (no USE_PTHREADS/PROXY_TO_PTHREAD).";
    return {
      body: (stderr.length ? stderr.join("\n") + "\n" : "") + hint + "\nSee docs/BUILD-EMSCRIPTEN.md",
      status: 500,
      contentType: "text/plain; charset=utf-8",
    };
  }

  try {
    php.callMain(["-r", "phpinfo();"]);
  } catch (e: any) {
    if (e?.message) stderr.push("[callMain] " + e.message);
  }

  const ok = stdout.length ? stdout.join("\n") : "";
  const err = stderr.length ? stderr.join("\n") : "";
  return {
    body: ok || err || "",
    status: ok ? 200 : err ? 500 : 204,
    contentType: ok ? "text/html; charset=utf-8" : "text/plain; charset=utf-8",
  };
}

export default {
  async fetch(request: Request): Promise<Response> {
    const url = new URL(request.url);
    const { pathname } = url;

    if (pathname === "/health") return textResponse("ok");

    if (pathname === "/__probe") {
      let importMetaUrl: string | null = null;
      try { importMetaUrl = (import.meta as any)?.url ?? null; } catch { importMetaUrl = null; }
      const body = {
        env: {
          esm: true,
          hasWorkerCtor: typeof (globalThis as any).Worker !== "undefined",
          hasSharedArrayBuffer: typeof (globalThis as any).SharedArrayBuffer !== "undefined",
          userAgent: (globalThis as any).navigator?.userAgent ?? null,
        },
        importMeta: { available: typeof import.meta !== "undefined", url: importMetaUrl },
      };
      return new Response(JSON.stringify(body, null, 2), { status: 200, headers: { "content-type": "application/json; charset=utf-8" } });
    }

    if (pathname === "/__jsplus") {
      try {
        const mod = await import("../scripts/php_8_4.js");
        const def = (mod as any)?.default ?? null;
        const hasFactory = typeof def === "function";
        const payload = { imported: true, hasDefaultFactory: hasFactory, exportKeys: Object.keys(mod || {}), note: "仅探测模块导出形态，不触发初始化。" };
        return new Response(JSON.stringify(payload, null, 2), { status: 200, headers: { "content-type": "application/json; charset=utf-8" } });
      } catch (e: any) {
        return textResponse("Import glue failed:\n" + (e?.stack || String(e)), 500);
      }
    }

    if (pathname === "/" || pathname === "/index.php") {
      try {
        const { body, status, contentType } = await runPhpInfo();
        return new Response(body, { status, headers: { "content-type": contentType } });
      } catch (e: any) {
        return textResponse("Runtime error: " + (e?.stack || String(e)), 500);
      }
    }

    return textResponse("Not Found", 404);
  },
};
