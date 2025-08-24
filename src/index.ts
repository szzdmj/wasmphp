import wasmBinary from "../scripts/php_8_4.wasm";
import { init as initPHP } from "../scripts/php_8_4.js";
import indexPhpSource from "../public/index.php";

export default {
  async fetch(request: Request, env: unknown, ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url);

    // Route / and /index.php to the PHP runtime
    const runPhp = url.pathname === "/" || url.pathname === "/index.php";
    if (!runPhp) {
      return new Response("PHP WASM initialized!", {
        headers: { "content-type": "text/plain; charset=utf-8" },
      });
    }

    const stdout: string[] = [];
    const stderr: string[] = [];

    try {
      // Ensure runtime is ready before using FS
      let resolveReady: () => void;
      const runtimeReady = new Promise<void>((res) => { resolveReady = res; });

      const php: any = await initPHP("WORKER", {
        wasmBinary,
        print: (txt: string) => stdout.push(String(txt)),
        printErr: (txt: string) => stderr.push(String(txt)),
        noInitialRun: true,
        onRuntimeInitialized: () => resolveReady!(),
      });

      // Wait for the Emscripten runtime to be ready
      await runtimeReady;

      // Prefer Module FS, fall back to global FS if the build doesn't attach it to the module
      const FS = (php as any)?.FS || (globalThis as any)?.FS;

      if (FS && typeof FS.writeFile === "function") {
        // Prepare VFS and write /public/index.php
        try { FS.mkdir("/public"); } catch {}
        FS.writeFile("/public/index.php", indexPhpSource);

        // Execute: php /public/index.php
        try {
          php.callMain(["/public/index.php"]);
        } catch (e: any) {
          // Some builds throw ExitStatus on non-zero exit; log to stderr for troubleshooting
          if (e?.message) stderr.push(e.message);
        }
      } else {
        // Fallback path: run phpinfo() without FS dependency
        try {
          php.callMain(["-r", "phpinfo();"]);
        } catch (e: any) {
          if (e?.message) stderr.push(e.message);
        }
      }

      const body = stdout.length ? stdout.join("\n") : (stderr.length ? stderr.join("\n") : "");
      const status = stdout.length ? 200 : (stderr.length ? 500 : 204);

      return new Response(body, {
        status,
        headers: { "content-type": "text/html; charset=utf-8" },
      });
    } catch (e: any) {
      const msg = e?.stack || e?.message || String(e);
      return new Response("Runtime error: " + msg, { status: 500 });
    }
  },
};
