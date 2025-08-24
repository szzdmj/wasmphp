// V24: 不再等待 onRuntimeInitialized；动态导入 + 规范化 wasm；深入自检 init 返回值与可用方法

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

function firstKeys(obj: any, max = 60) {
  try {
    return Object.keys(obj || {}).slice(0, max);
  } catch {
    return [];
  }
}

export default {
  async fetch(req: Request): Promise<Response> {
    const url = new URL(req.url);

    // 1) 仅诊断 .wasm 导入
    if (url.pathname === "/__diag") {
      try {
        const wasmMod = await import("../scripts/php_8_4.wasm");
        const raw = (wasmMod as any).default;
        const normalized = await normalizeWasmModule(raw);
        return new Response(JSON.stringify({
          imported: !!raw,
          type: raw?.constructor?.name || typeof raw,
          normalized: normalized?.constructor?.name
        }), { headers: { "content-type": "application/json; charset=utf-8" } });
      } catch (e: any) {
        return new Response(JSON.stringify({ imported: false, error: e?.message || String(e) }), {
          status: 500,
          headers: { "content-type": "application/json; charset=utf-8" }
        });
      }
    }

    // 2) 诊断 JS 模块导出
    if (url.pathname === "/__js") {
      try {
        const phpModule = await import("../scripts/php_8_4.js");
        const expKeys = firstKeys(phpModule);
        const def = (phpModule as any).default;
        const defType = typeof def;
        const defIsFunc = defType === "function";
        const init = (phpModule as any).init;
        const initType = typeof init;
        return new Response(JSON.stringify({
          exportKeys: expKeys,
          default: { type: defType, isFunction: defIsFunc, ctor: def?.constructor?.name || null, length: def?.length ?? null },
          init: { type: initType, isFunction: initType === "function", length: init?.length ?? null }
        }), { headers: { "content-type": "application/json; charset=utf-8" } });
      } catch (e: any) {
        return new Response(JSON.stringify({ error: "[import-js] " + (e?.message || String(e)) }), {
          status: 500,
          headers: { "content-type": "application/json; charset=utf-8" }
        });
      }
    }

    const isPhpRoute = url.pathname === "/" || url.pathname === "/index.php";
    if (!isPhpRoute) {
      return new Response("OK", { headers: { "content-type": "text/plain; charset=utf-8" } });
    }

    try {
      // A) 导入 Emscripten JS
      const jsMod = await import("../scripts/php_8_4.js");
      const initCandidate =
        (jsMod as any).init ||
        (jsMod as any).default ||
        (jsMod as any);

      if (typeof initCandidate !== "function") {
        return new Response("Runtime error: PHP init function not found on module export", { status: 500 });
      }

      // B) 导入并规范化 wasm Module
      const wasmMod = await import("../scripts/php_8_4.wasm");
      const wasmModule = await normalizeWasmModule((wasmMod as any).default);

      const stdout: string[] = [];
      const stderr: string[] = [];

      const moduleOptions: any = {
        noInitialRun: true,
        print: (txt: string) => { try { stdout.push(String(txt)); } catch {} },
        printErr: (txt: string) => { try { stderr.push(String(txt)); } catch {} },
        onAbort: (reason: any) => { try { stderr.push("[abort] " + String(reason)); } catch {} },

        // 同步实例化，完全绕开 fetch/URL
        instantiateWasm: (
          imports: WebAssembly.Imports,
          successCallback: (instance: WebAssembly.Instance) => void
        ) => {
          const instance = new WebAssembly.Instance(wasmModule, imports);
          successCallback(instance);
          return instance.exports as any;
        }
      };

      // C) 初始化：支持两种签名；若返回 Promise，等待它
      let initResult: any;
      try {
        initResult = (initCandidate as any)(moduleOptions);
      } catch (e) {
        // 一些构建要求第一个参数为环境标签
        initResult = (initCandidate as any)("WORKER", moduleOptions);
      }

      let php: any = initResult && typeof initResult.then === "function"
        ? await initResult
        : initResult;

      // D) 自检返回对象
      const phpKeys = firstKeys(php);
      const hasCallMain = php && typeof php.callMain === "function";
      const hasCcall = php && typeof php.ccall === "function";
      const hasCwrap = php && typeof php.cwrap === "function";

      // 提供一个调试路由，查看 keys
      if (url.pathname === "/__keys") {
        return new Response(JSON.stringify({
          typeofPhp: typeof php,
          ctor: php?.constructor?.name || null,
          keys: phpKeys,
          hasCallMain, hasCcall, hasCwrap
        }), { headers: { "content-type": "application/json; charset=utf-8" } });
      }

      if (!php || (!hasCallMain && !hasCcall && !hasCwrap)) {
        const msg = [
          "Runtime error: Emscripten init did not return expected Module.",
          "typeof php=" + (typeof php) + ", ctor=" + (php?.constructor?.name || "null"),
          "keys=" + JSON.stringify(phpKeys)
        ].join("\n");
        console.error(msg);
        return new Response(msg, { status: 500, headers: { "content-type": "text/plain; charset=utf-8" } });
      }

      // E) 运行 phpinfo（优先用 callMain；否则尝试 ccall）
      try {
        if (hasCallMain) {
          php.callMain(["-r", "phpinfo();"]);
        } else if (hasCcall) {
          // 退路：直接调用 main
          php.ccall("main", "number", ["number", "number"], [2, 0]); // 参数形式可能不完全匹配，仅作为探针
        } else {
          throw new Error("No callable entrypoint found (callMain/ccall)");
        }
      } catch (e: any) {
        stderr.push("[call] " + (e?.message || String(e)));
      }

      const body = stdout.length ? stdout.join("\n") : (stderr.length ? stderr.join("\n") : "No output");
      const status = stdout.length ? 200 : (stderr.length ? 500 : 204);
      return new Response(body, {
        status,
        headers: { "content-type": stdout.length ? "text/html; charset=utf-8" : "text/plain; charset=utf-8" }
      });
    } catch (e: any) {
      const msg = e?.stack || e?.message || String(e);
      console.error("[top] " + msg);
      return new Response("Runtime error: " + msg, {
        status: 500,
        headers: { "content-type": "text/plain; charset=utf-8" }
      });
    }
  }
};
