// V31 执行版（兼容回退 + 诊断）：在“单线程”构建前提下运行 phpinfo()
// - ESM 直接导入 .wasm（Wrangler 产出 WebAssembly.Module）
// - instantiateWasm 同步实例化，并调用 successCallback
// - 优先使用 callMain；若无则回退 run + Module.arguments
// - 提供 /__probe /__jsplus /__mod 诊断路由

import wasmAsset from "../scripts/php_8_4.wasm";

// 轻量 polyfill，避免 glue 顶层访问 location/self 抛错
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
  // 兼容 Emscripten：既返回 exports，也调用 successCallback
  return (imports: WebAssembly.Imports, successCallback: (i: WebAssembly.Instance) => void) => {
    const instance = new WebAssembly.Instance(wasmModule, imports);
    try {
      successCallback(instance);
    } catch {}
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
    noInitialRun: true, // 我们手动触发
    print: () => {},
    printErr: () => {},
    onRuntimeInitialized: () => {},
    arguments: ["-r", "phpinfo();"], // 供 run 回退使用
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

async function createPhpModule(debug: string[], stdout: string[], stderr: string[]) {
  debug.push("step:import-glue");
  const phpModule = await import("../scripts/php_8_4.js");
  const initCandidate =
    (phpModule as any).init || (phpModule as any).default || (phpModule as any);

  if (typeof initCandidate !== "function") {
    throw new Error(
      "PHP init function not found on module export. " +
        "Hint: ensure -s MODULARIZE=1 -s EXPORT_ES6=1. " +
        `Exports: ${Object.keys(phpModule || {}).join(", ")}`
    );
  }

  debug.push("step:build-options");
  let resolveReady: () => void = () => {};
  const runtimeReady = new Promise<void>((res) => (resolveReady = res));

  const moduleOptions = await buildModuleOptions();
  moduleOptions.print = (txt: string) => {
    try {
      stdout.push(String(txt));
    } catch {}
  };
  moduleOptions.printErr = (txt: string) => {
    try {
      stderr.push(String(txt));
    } catch {}
  };
  moduleOptions.onRuntimeInitialized = () => {
    try {
      resolveReady();
    } catch {}
  };

  debug.push("step:init-factory");
  let php: any;
  try {
    php = await (initCandidate as any)(moduleOptions);
  } catch (e1: any) {
    try {
      php = await (initCandidate as any)("WORKER", moduleOptions);
      debug.push("factory:retry-with-WORKER:ok");
    } catch (e2: any) {
      throw new Error(
        "PHP factory invocation failed.\n" +
          "First error: " +
          (e1?.stack || e1) +
          "\n" +
          "Retry error: " +
          (e2?.stack || e2)
      );
    }
  }

  debug.push("step:await-ready");
  const READY_TIMEOUT_MS = 8000;
  const ready = await Promise.race([
    runtimeReady.then(() => true),
    new Promise<boolean>((res) => setTimeout(() => res(false), READY_TIMEOUT_MS)),
  ]);
  if (!ready) {
    throw new Error(
      "Emscripten runtime not initialized within timeout. " +
        "Ensure the WASM build is single-threaded (no USE_PTHREADS/PROXY_TO_PTHREAD)."
    );
  }

  return php;
}

async function runPhpInfo(): Promise<{ body: string; status: number; contentType: string }> {
  const debug: string[] = [];
  const stdout: string[] = [];
  const stderr: string[] = [];

  try {
    const php = await createPhpModule(debug, stdout, stderr);

    debug.push("step:detect-entry");
    const hasCallMain = typeof (php as any).callMain === "function";
    const hasRun = typeof (php as any).run === "function";

    if (hasCallMain) {
      debug.push("entry:callMain");
      try {
        (php as any).callMain(["-r", "phpinfo();"]);
      } catch (e: any) {
        stderr.push("[callMain] " + (e?.message || String(e)));
      }
    } else if (hasRun) {
      debug.push("entry:run");
      try {
        (php as any).arguments = ["-r", "phpinfo();"];
        (php as any).run();
      } catch (e: any) {
        stderr.push("[run] " + (e?.message || String(e)));
      }
    } else {
      const summary = {
        keys: Object.keys(php || {}),
        has: {
          callMain: hasCallMain,
          run: hasRun,
          ccall: typeof (php as any).ccall === "function",
          cwrap: typeof (php as any).cwrap === "function",
          _main: typeof (php as any)._main === "function",
          FS: !!(php as any).FS,
        },
      };
      return {
        body:
          "No suitable entry to execute phpinfo(): neither callMain nor run exists.\n" +
          JSON.stringify(summary, null, 2) +
          "\nIf ccall/cwrap are present, we can add a wrapper to invoke _main with argv.",
        status: 500,
        contentType: "text/plain; charset=utf-8",
      };
    }

    const ok = stdout.length ? stdout.join("\n") : "";
    const err = stderr.length ? stderr.join("\n") : "";
    return {
      body: (ok || err || "") + (debug.length ? `\n<!-- trace:${debug.join("->")} -->` : ""),
      status: ok ? 200 : err ? 500 : 204,
      contentType: ok ? "text/html; charset=utf-8" : "text/plain; charset=utf-8",
    };
  } catch (e: any) {
    return {
      body:
        "Runtime error: " + (e?.stack || String(e)) + "\n" + "trace: " + debug.join(" -> "),
      status: 500,
      contentType: "text/plain; charset=utf-8",
    };
  }
}

export default {
  async fetch(request: Request): Promise<Response> {
    const url = new URL(request.url);
    const { pathname } = url;

    if (pathname === "/health") return textResponse("ok");

    if (pathname === "/__probe") {
      let importMetaUrl: string | null = null;
      try {
        importMetaUrl = (import.meta as any)?.url ?? null;
      } catch {
        importMetaUrl = null;
      }
      const body = {
        env: {
          esm: true,
          hasWorkerCtor: typeof (globalThis as any).Worker !== "undefined",
          hasSharedArrayBuffer: typeof (globalThis as any).SharedArrayBuffer !== "undefined",
          userAgent: (globalThis as any).navigator?.userAgent ?? null,
        },
        importMeta: { available: typeof import.meta !== "undefined", url: importMetaUrl },
      };
      return new Response(JSON.stringify(body, null, 2), {
        status: 200,
        headers: { "content-type": "application/json; charset=utf-8" },
      });
    }

    if (pathname === "/__jsplus") {
      try {
        const mod = await import("../scripts/php_8_4.js");
        const def = (mod as any)?.default ?? null;
        const hasFactory = typeof def === "function";
        const payload = {
          imported: true,
          hasDefaultFactory: hasFactory,
          exportKeys: Object.keys(mod || {}),
          note: "仅探测模块导出形态，不触发初始化。",
        };
        return new Response(JSON.stringify(payload, null, 2), {
          status: 200,
          headers: { "content-type": "application/json; charset=utf-8" },
        });
      } catch (e: any) {
        return textResponse("Import glue failed:\n" + (e?.stack || String(e)), 500);
      }
    }

    if (pathname === "/__mod") {
      const debug: string[] = [];
      const stdout: string[] = [];
      const stderr: string[] = [];
      try {
        const php = await createPhpModule(debug, stdout, stderr);
        const summary = {
          keys: Object.keys(php || {}),
          has: {
            callMain: typeof (php as any).callMain === "function",
            run: typeof (php as any).run === "function",
            ccall: typeof (php as any).ccall === "function",
            cwrap: typeof (php as any).cwrap === "function",
            _main: typeof (php as any)._main === "function",
            FS: !!(php as any).FS,
          },
          trace: debug,
        };
        return new Response(JSON.stringify(summary, null, 2), {
          status: 200,
          headers: { "content-type": "application/json; charset=utf-8" },
        });
      } catch (e: any) {
        return textResponse(
          "init error: " + (e?.stack || String(e)) + "\ntrace: " + debug.join("->"),
          500
        );
      }
    }

    if (pathname === "/" || pathname === "/index.php") {
      try {
        const { body, status, contentType } = await runPhpInfo();
        return new Response(body, { status, headers: { "content-type": contentType } });
      } catch (e: any) {
        return textResponse("Runtime error (fetch): " + (e?.stack || String(e)), 500);
      }
    }

    return textResponse("Not Found", 404);
  },
};
