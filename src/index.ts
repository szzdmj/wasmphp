// 最小改动版：保留“动态导入 glue + 提供 wasmBinary”结构
// - 在导入 glue 前补上 location/self polyfill，避免顶层 location.href 报错
// - 如存在 env.PHP_WASM（wrangler 绑定的预编译 Module），通过 instantiateWasm 走“无运行时代码生成”路径
// - 否则回退到 wasmBinary（在 Workers 上可能仍受平台限制）

import wasmBinary from "../scripts/php_8_4.wasm";

// 轻量 polyfill：在动态 import glue 之前可见
{
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
}

function makeInstantiateWithModule(wasmModule: WebAssembly.Module) {
  return (imports: WebAssembly.Imports /* imports */, _cb: (i: WebAssembly.Instance) => void) => {
    // 仅实例化（不编译），符合 Emscripten 的同步返回导出接口
    const instance = new WebAssembly.Instance(wasmModule, imports);
    return instance.exports as any;
  };
}

export default {
  async fetch(request: Request, env: any): Promise<Response> {
    try {
      const url = new URL(request.url);
      const isPhpRoute = url.pathname === "/" || url.pathname === "/index.php";
      if (!isPhpRoute) {
        return new Response("PHP WASM initialized", {
          headers: { "content-type": "text/plain; charset=utf-8" },
        });
      }

      // 仅动态导入 JS 模块，避免对巨大的 WASM 二进制做 __toESM 包装导致枚举属性
      const phpModule = await import("../scripts/php_8_4.js");

      // 兼容不同导出方式，优先取 init，其次 default，其次模块本身
      const initCandidate =
        (phpModule as any).init ||
        (phpModule as any).default ||
        (phpModule as any);

      if (typeof initCandidate !== "function") {
        return new Response("Runtime error: PHP init function not found on module export", {
          status: 500,
          headers: { "content-type": "text/plain; charset=utf-8" },
        });
      }

      const stdout: string[] = [];
      const stderr: string[] = [];

      // 等待 Emscripten 运行时就绪
      let resolveReady: () => void = () => {};
      const runtimeReady = new Promise<void>((res) => { resolveReady = res; });

      const moduleOptions: any = {
        wasmBinary,           // 你的原始思路：提供字节，非路径
        noInitialRun: true,
        print: (txt: string) => { try { stdout.push(String(txt)); } catch {} },
        printErr: (txt: string) => { try { stderr.push(String(txt)); } catch {} },
        onRuntimeInitialized: () => { try { resolveReady(); } catch {} },
      };

      // 若存在部署期预编译的 Module 绑定，则完全避免运行时代码生成
      if (typeof env?.PHP_WASM !== "undefined") {
        moduleOptions.instantiateWasm = makeInstantiateWithModule(env.PHP_WASM as WebAssembly.Module);
      }

      // 尝试两种 init 签名：单参与带 "WORKER"
      let php: any;
      try {
        php = await (initCandidate as any)(moduleOptions);
      } catch {
        php = await (initCandidate as any)("WORKER", moduleOptions);
      }

      // 确保运行时完全就绪
      await runtimeReady;

      // 完全绕过 FS，仅执行内联 phpinfo()
      try {
        php.callMain(["-r", "phpinfo();"]);
      } catch (e: any) {
        if (e?.message) stderr.push("[callMain] " + e.message);
      }

      const body = stdout.length ? stdout.join("\n") : (stderr.length ? stderr.join("\n") : "");
      const status = stdout.length ? 200 : (stderr.length ? 500 : 204);

      return new Response(body, {
        status,
        headers: { "content-type": "text/html; charset=utf-8" },
      });
    } catch (e: any) {
      const msg = e?.stack || e?.message || String(e);
      return new Response("Runtime error: " + msg, {
        status: 500,
        headers: { "content-type": "text/plain; charset=utf-8" },
      });
    }
  },
};
