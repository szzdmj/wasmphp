import wasmBinary from "../scripts/php_8_4.wasm";
import { init as initPHP } from "../scripts/php_8_4.js";

export default {
  async fetch(request: Request): Promise<Response> {
    try {
      const url = new URL(request.url);

      // 仅在根路径与 /index.php 运行 PHP，其他路径返回健康检查信息
      if (!(url.pathname === "/" || url.pathname === "/index.php")) {
        return new Response("PHP WASM initialized", {
          headers: { "content-type": "text/plain; charset=utf-8" },
        });
      }

      const stdout: string[] = [];
      const stderr: string[] = [];

      // 等待 Emscripten 运行时就绪
      let resolveReady: () => void = () => {};
      const runtimeReady = new Promise<void>((res) => {
        resolveReady = res;
      });

      // 兼容两种 init 签名：
      // 1) initPHP({ ...ModuleOptions })
      // 2) initPHP("WORKER", { ...ModuleOptions })
      const moduleOptions: any = {
        wasmBinary,
        noInitialRun: true,
        print: (txt: string) => {
          try {
            stdout.push(String(txt));
          } catch {}
        },
        printErr: (txt: string) => {
          try {
            stderr.push(String(txt));
          } catch {}
        },
        onRuntimeInitialized: () => {
          try {
            resolveReady();
          } catch {}
        },
      };

      let php: any;
      try {
        // 优先尝试常见签名（单参）
        php = await (initPHP as any)(moduleOptions);
      } catch {
        // 回退到双参签名
        php = await (initPHP as any)("WORKER", moduleOptions);
      }

      // 等待运行时完全就绪
      await runtimeReady;

      // 仅执行内联 phpinfo()，彻底回避 FS
      try {
        php.callMain(["-r", "phpinfo();"]);
      } catch (e: any) {
        if (e?.message) stderr.push(e.message);
      }

      const body =
        stdout.length ? stdout.join("\n") : stderr.length ? stderr.join("\n") : "";
      const status = stdout.length ? 200 : stderr.length ? 500 : 204;

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
