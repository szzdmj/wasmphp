// V23: 动态导入 + 规范化 .wasm（Module 或 ArrayBuffer）+ 全流程错误上屏与日志

async function normalizeWasmModule(wasmDefault: any): Promise<WebAssembly.Module> {
  try {
    if (wasmDefault && wasmDefault.constructor?.name === "Module") {
      return wasmDefault as WebAssembly.Module; // 已是 WebAssembly.Module
    }
    // 兼容返回 ArrayBuffer/TypedArray 的情况
    const bytes: ArrayBuffer | null =
      wasmDefault instanceof ArrayBuffer
        ? wasmDefault
        : (ArrayBuffer.isView(wasmDefault) ? (wasmDefault as ArrayBufferView).buffer : null);

    if (bytes) {
      return await WebAssembly.compile(bytes);
    }
    throw new Error("Unsupported wasm default export type: " + (typeof wasmDefault));
  } catch (e: any) {
    throw new Error("normalizeWasmModule failed: " + (e?.message || String(e)));
  }
}

export default {
  async fetch(req: Request): Promise<Response> {
    const url = new URL(req.url);

    // 诊断：仅检查 wasm 导入与类型
    if (url.pathname === "/__diag") {
      try {
        const wasmMod = await import("../scripts/php_8_4.wasm");
        const raw = (wasmMod as any).default;
        let kind = raw?.constructor?.name || typeof raw;
        let compiled = false;
        let isModule = kind === "Module";
        if (!isModule) {
          try {
            await normalizeWasmModule(raw);
            compiled = true;
          } catch {}
        }
        return new Response(
          JSON.stringify({ imported: !!raw, type: kind, normalized: isModule || compiled }),
          { headers: { "content-type": "application/json; charset=utf-8" } }
        );
      } catch (e: any) {
        const msg = e?.stack || e?.message || String(e);
        return new Response(JSON.stringify({ imported: false, error: msg }), {
          status: 500,
          headers: { "content-type": "application/json; charset=utf-8" }
        });
      }
    }

    // 仅在 / 或 /index.php 路径运行 PHP
    const isPhpRoute = url.pathname === "/" || url.pathname === "/index.php";
    if (!isPhpRoute) {
      return new Response("OK", {
        headers: { "content-type": "text/plain; charset=utf-8" }
      });
    }

    try {
      // 1) 动态导入 Emscripten JS
      let initCandidate: any;
      try {
        const phpModule = await import("../scripts/php_8_4.js");
        initCandidate =
          (phpModule as any).init ||
          (phpModule as any).default ||
          (phpModule as any);
        if (typeof initCandidate !== "function") {
          throw new Error("PHP init function not found in module exports");
        }
      } catch (e: any) {
        const msg = "[import-js] " + (e?.message || String(e));
        console.error(msg);
        return new Response("Runtime error: " + msg, { status: 500 });
      }

      // 2) 动态导入 .wasm 并规范化
      let wasmModule: WebAssembly.Module;
      try {
        const wasmMod = await import("../scripts/php_8_4.wasm");
        wasmModule = await normalizeWasmModule((wasmMod as any).default);
      } catch (e: any) {
        const msg = "[import-wasm] " + (e?.message || String(e));
        console.error(msg);
        return new Response("Runtime error: " + msg, { status: 500 });
      }

      // 3) 准备 Emscripten 选项
      const stdout: string[] = [];
      const stderr: string[] = [];

      let resolveReady: () => void = () => {};
      let readyTimedOut = false;
      const runtimeReady = new Promise<void>((res, rej) => {
        resolveReady = res;
        // 防止永不触发 onRuntimeInitialized
        setTimeout(() => {
          readyTimedOut = true;
          rej(new Error("onRuntimeInitialized timeout"));
        }, 15000);
      });

      const moduleOptions: any = {
        noInitialRun: true,
        print: (txt: string) => {
          try { stdout.push(String(txt)); } catch {}
        },
        printErr: (txt: string) => {
          try { stderr.push(String(txt)); } catch {}
        },
        onRuntimeInitialized: () => {
          try { resolveReady(); } catch {}
        },
        onAbort: (reason: any) => {
          try { stderr.push("[abort] " + String(reason)); } catch {}
        },
        // 关键：同步实例化，避免 fetch/URL
        instantiateWasm: (
          imports: WebAssembly.Imports,
          successCallback: (instance: WebAssembly.Instance) => void
        ) => {
          const instance = new WebAssembly.Instance(wasmModule, imports);
          successCallback(instance);
          return instance.exports as any; // Emscripten 需要返回 exports
        }
      };

      // 4) 初始化（兼容两种签名）
      let php: any;
      try {
        php = await (initCandidate as any)(moduleOptions);
      } catch {
        php = await (initCandidate as any)("WORKER", moduleOptions);
      }

      try {
        await runtimeReady;
      } catch (e: any) {
        const msg = "[runtime-ready] " + (e?.message || String(e));
        console.error(msg);
        stderr.push(msg);
      }

      // 5) 执行 phpinfo()（避免触碰 FS）
      try {
        php.callMain(["-r", "phpinfo();"]);
      } catch (e: any) {
        const msg = "[callMain] " + (e?.message || String(e));
        console.error(msg);
        stderr.push(msg);
      }

      const body = stdout.length ? stdout.join("\n") : (stderr.length ? stderr.join("\n") : "No output");
      const status = stdout.length ? 200 : (stderr.length ? 500 : (readyTimedOut ? 504 : 204));
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
