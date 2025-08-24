// V25: 带版本标记与诊断路由
const VERSION = "V25-2025-08-24T09:57Z";

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

    if (url.pathname === "/__ver") {
      return new Response(
        JSON.stringify({ version: VERSION, now: new Date().toISOString() }),
        { headers: { "content-type": "application/json; charset=utf-8", "x-version": VERSION } }
      );
    }

    // 仅诊断 .wasm 导入
    if (url.pathname === "/__diag") {
      try {
        const wasmMod = await import("../scripts/php_8_4.wasm");
        const raw = (wasmMod as any).default;
        const normalized = await normalizeWasmModule(raw);
        return new Response(JSON.stringify({
          version: VERSION,
          imported: !!raw,
          type: raw?.constructor?.name || typeof raw,
          normalized: normalized?.constructor?.name
        }), { headers: { "content-type": "application/json; charset=utf-8", "x-version": VERSION } });
      } catch (e: any) {
        return new Response(JSON.stringify({ version: VERSION, imported: false, error: e?.message || String(e) }), {
          status: 500,
          headers: { "content-type": "application/json; charset=utf-8", "x-version": VERSION }
        });
      }
    }

    // 诊断 JS 模块导出
    if (url.pathname === "/__js") {
      try {
        const phpModule = await import("../scripts/php_8_4.js");
        const expKeys = firstKeys(phpModule);
        const def = (phpModule as any).default;
        const init = (phpModule as any).init;
        return new Response(JSON.stringify({
          version: VERSION,
          exportKeys: expKeys,
          default: { type: typeof def, isFunction: typeof def === "function", ctor: def?.constructor?.name || null, length: def?.length ?? null },
          init: { type: typeof init, isFunction: typeof init === "function", length: init?.length ?? null }
        }), { headers: { "content-type": "application/json; charset=utf-8", "x-version": VERSION } });
      } catch (e: any) {
        return new Response(JSON.stringify({ version: VERSION, error: "[import-js] " + (e?.message || String(e)) }), {
          status: 500,
          headers: { "content-type": "application/json; charset=utf-8", "x-version": VERSION }
        });
      }
    }

    // 初始化 PHP 仅在根路径
    const isPhpRoute = url.pathname === "/" || url.pathname === "/index.php";
    if (!isPhpRoute) {
      return new Response("OK", { headers: { "content-type": "text/plain; charset=utf-8", "x-version": VERSION } });
    }

    try {
      // A) 动态导入 JS
      const jsMod = await import("../scripts/php_8_4.js");
      const initCandidate =
        (jsMod as any).init ||
        (jsMod as any).default ||
        (jsMod as any);

      if (typeof initCandidate !== "function") {
        return new Response("Runtime error: PHP init function not found on module export", {
          status: 500,
          headers: { "content-type": "text/plain; charset=utf-8", "x-version": VERSION }
        });
      }

      // B) 动态导入并规范化 wasm
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

      // C) 初始化（支持两种签名；若返回 Promise，等待）
      let initResult: any;
      try {
        initResult = (initCandidate as any)(moduleOptions);
      } catch {
        initResult = (initCandidate as any)("WORKER", moduleOptions);
      }
      const php: any = initResult && typeof initResult.then === "function" ? await initResult : initResult;

      // D) 自检返回对象
      const phpKeys = firstKeys(php);
      const hasCallMain = php && typeof php.callMain === "function";
      const hasCcall = php && typeof php.ccall === "function";
      const hasCwrap = php && typeof php.cwrap === "function";

      if (url.pathname === "/__keys") {
        return new Response(JSON.stringify({
          version: VERSION,
          typeofPhp: typeof php,
          ctor: php?.constructor?.name || null,
          keys: phpKeys,
          hasCallMain, hasCcall, hasCwrap
        }), { headers: { "content-type": "application/json; charset=utf-8", "x-version": VERSION } });
      }

      if (!php || (!hasCallMain && !hasCcall && !hasCwrap)) {
        const msg = [
          "Runtime error: Emscripten init did not return expected Module.",
          "typeof php=" + (typeof php) + ", ctor=" + (php?.constructor?.name || "null"),
          "keys=" + JSON.stringify(phpKeys)
        ].join("\n");
        console.error(msg);
        return new Response(msg, { status: 500, headers: { "content-type": "text/plain; charset=utf-8", "x-version": VERSION } });
      }

      // E) 尝试运行 phpinfo()
      try {
        if (hasCallMain) {
          php.callMain(["-r", "phpinfo();"]);
        } else if (hasCcall) {
          // 退路：尝试直接 main（不保证参数完全匹配，仅作探针）
          php.ccall("main", "number", ["number", "number"], [2, 0]);
        } else {
          throw new Error("No callable entrypoint (callMain/ccall)");
        }
      } catch (e: any) {
        stderr.push("[call] " + (e?.message || String(e)));
      }

      const body = stdout.length ? stdout.join("\n") : (stderr.length ? stderr.join("\n") : "No output");
      const status = stdout.length ? 200 : (stderr.length ? 500 : 204);
      return new Response(body, {
        status,
        headers: { "content-type": stdout.length ? "text/html; charset=utf-8" : "text/plain; charset=utf-8", "x-version": VERSION }
      });
    } catch (e: any) {
      const msg = e?.stack || e?.message || String(e);
      console.error("[top] " + msg);
      return new Response("Runtime error: " + msg, {
        status: 500,
        headers: { "content-type": "text/plain; charset=utf-8", "x-version": VERSION }
      });
    }
  }
};
